using MC.Shared.Application.Models;

namespace MC.Catalog.Application.Responses;

// Could be optional but used just in case to add more properties in the future
public record ListingsPaginatedResponse<T>(
    T[] Items,
    int PageSize,
    int PageIndex,
    int TotalPages,
    bool HasPreviousPage,
    bool HasNextPage)
    : PaginatedCollection<T>(Items, PageSize, PageIndex, TotalPages, HasPreviousPage, HasNextPage);