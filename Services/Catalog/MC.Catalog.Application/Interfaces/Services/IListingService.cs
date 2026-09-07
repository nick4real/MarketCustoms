using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Models;
using MC.Catalog.Application.Requests;
using MC.Catalog.Application.Responses;
using MC.Shared.Application.Common;

namespace MC.Catalog.Application.Interfaces.Services;

public interface IListingService
{
    Task<Result<PaginatedResponse<ListingCatalogViewDto>>> GetListingsAsync(CancellationToken ct, PaginationParams paginationParams, ListingParams? listingParams);
    Task<Result<ListingDetailedResponse>> GetDetailedListingByIdAsync(string id, CancellationToken ct);
    Task<Result<ListingDetailedResponse>> CreateListingAsync(CreateListingRequest listing, CancellationToken ct);
}
