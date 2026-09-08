using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Models;
using MC.Catalog.Application.Requests;
using MC.Catalog.Application.Responses;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;
using MC.Shared.Application.Common;

namespace MC.Catalog.Application.Services;

public class ListingService(IListingRepository listingRepository) : IListingService
{
    public async Task<Result<ListingDetailedResponse>> GetDetailedListingByIdAsync(string id, CancellationToken ct)
    {
        if (id.Length != 24)
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

    public async Task<Result<PaginatedResponse<ListingCatalogViewDto>>> GetListingsAsync(CancellationToken ct, PaginationParams paginationParams, ListingParams? listingParams)
    {
        int skip = (paginationParams.PageIndex - 1) * paginationParams.PageSize;
        int take = paginationParams.PageSize;

        var pagedListings = await listingRepository.GetListingsCatalogViewAsync(skip, take, ct, listingParams);
        int totalPages = pagedListings.TotalItems == 0
            ? 0
            : (int)Math.Ceiling(pagedListings.TotalItems / (double)paginationParams.PageSize);
        bool hasPreviousPage = paginationParams.PageIndex > 1;
        bool hasNextPage = (paginationParams.PageIndex * paginationParams.PageSize) < pagedListings.TotalItems;

        return Result<PaginatedResponse<ListingCatalogViewDto>>.Success(new PaginatedResponse<ListingCatalogViewDto>(
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
                OwnerId = request.OwnerId,
                Title = request.Title,
                Description = request.Description,
                CategoryId = request.CategoryId,
                Category = new Category { Id = request.CategoryId, Name = string.Empty },
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

    private static ListingCatalogViewDto MapCatalogView(ListingCatalogView view)
        => new(
            view.Id,
            view.Title,
            view.Description,
            view.Price,
            view.ImageLink);

    private static ListingDetailedResponse MapListingDetailedResponse(Listing listing)
        => new(
            listing.Id,
            listing.Title,
            listing.Description,
            listing.CategoryId,
            new CategoryDto(
                listing.Category.Id, 
                listing.Category.Name, 
                null),
            listing.CreatedAt.UtcDateTime,
            listing.Price,
            listing.StockQuantity,
            listing.ImageLinks ?? [],
            listing.Tags ?? [],
            listing.Parameters.Select(parameter => new ListingParameterDto(parameter.Item1, parameter.Item2)).ToList());
}
