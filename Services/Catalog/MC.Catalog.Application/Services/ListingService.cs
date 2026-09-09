using MC.Catalog.Application.Common;
using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Models;
using MC.Catalog.Application.Requests;
using MC.Catalog.Application.Responses;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;
using MC.Shared.Application.Common;
using MC.Shared.Application.Requests;

namespace MC.Catalog.Application.Services;

public class ListingService(IListingRepository listingRepository) : IListingService
{
    public async Task<Result<ListingDetailedResponse>> GetDetailedListingByIdAsync(string id, CancellationToken ct)
    {
        if (id.Length != FieldConstraints.MongoDbKeySize)
        {
            return Result<ListingDetailedResponse>.Failure(new Error(ErrorCode.ValidationFailed, "Invalid listing ID format."));
        }

        var listing = await listingRepository.GetListingByIdAsync(id, ct);
        if (listing is null)
        {
            return Result<ListingDetailedResponse>.Failure(new Error(ErrorCode.NotFound, $"Listing with ID {id} was not found."));
        }

        return Result<ListingDetailedResponse>.Success(MapListingDetailedResponse(listing));
    }

    public async Task<Result<ListingsPaginatedResponse<ListingCardViewDto>>> GetListingsAsync(CancellationToken ct, PaginationParams paginationParams, ListingParams? listingParams)
    {
        int skip = (paginationParams.PageIndex - 1) * paginationParams.PageSize;
        int take = paginationParams.PageSize;

        var pagedListings = await listingRepository.GetListingsCatalogViewAsync(skip, take, ct, listingParams);
        int totalPages = pagedListings.TotalItems == 0
            ? 0
            : (int)Math.Ceiling(pagedListings.TotalItems / (double)paginationParams.PageSize);
        bool hasPreviousPage = paginationParams.PageIndex > 1;
        bool hasNextPage = (paginationParams.PageIndex * paginationParams.PageSize) < pagedListings.TotalItems;

        return Result<ListingsPaginatedResponse<ListingCardViewDto>>.Success(new ListingsPaginatedResponse<ListingCardViewDto>(
            pagedListings.Items.Select(MapCatalogView).ToArray(),
            paginationParams.PageSize,
            paginationParams.PageIndex,
            totalPages,
            hasPreviousPage,
            hasNextPage));
    }

    public async Task<Result<ListingDetailedResponse>> CreateListingAsync(CreateListingRequest request, CancellationToken ct)
    {
        try
        {
            var listing = new Listing
            {
                OwnerGuid = request.OwnerGuid,
                Title = request.Title,
                Description = request.Description,
                CategoryId = request.CategoryId,
                Category = new Category { Id = request.CategoryId, Name = string.Empty },
                Location = new Location
                {
                    Country = request.Location.Country,
                    Region = request.Location.Region,
                    City = request.Location.City,
                    District = request.Location.District,
                    Latitude = request.Location.Latitude,
                    Longitude = request.Location.Longitude
                },
                Price = request.Price,
                StockQuantity = request.StockQuantity,
                ImageLinks = request.ImageLinks ?? [],
                Tags = request.Tags ?? [],
                Parameters = request.Parameters ?? [],
                CreatedAt = DateTimeOffset.UtcNow
            };
            await listingRepository.AddListingAsync(listing, ct);
            return Result<ListingDetailedResponse>.Success(MapListingDetailedResponse(listing));
        }
        catch
        {
            return Result<ListingDetailedResponse>.Failure(new Error(ErrorCode.InternalServerError, "An error occurred while creating the listing."));
        }
    }

    private static LocationDto MapLocation(Location location)
        => new(
            location.Country,
            location.Region,
            location.City,
            location.District,
            location.Latitude,
            location.Longitude);

    private static CategoryDto MapCategory(Category category)
        => new(
            category.Id,
            category.Name,
            category.ChildCategories?.Select(MapCategory).ToList());

    private static ListingCardViewDto MapCatalogView(ListingCardView view)
        => new(
            view.Id,
            view.Title,
            view.Description,
            view.Price,
            view.ImageLink);

    private static ListingDetailedResponse MapListingDetailedResponse(Listing listing)
        => new(
            listing.OwnerGuid,
            listing.Id,
            listing.Title,
            listing.Description,
            listing.CategoryId,
            MapCategory(listing.Category),
            MapLocation(listing.Location),
            listing.CreatedAt.UtcDateTime,
            listing.Price,
            listing.StockQuantity,
            listing.ImageLinks ?? [],
            listing.Tags ?? [],
            listing.Parameters ?? []);
}
