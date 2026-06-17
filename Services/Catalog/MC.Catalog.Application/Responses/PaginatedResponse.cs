namespace MC.Catalog.Application.Responses;

public record PaginatedResponse<T>(T[] Items, int PageSize, int PageIndex, int TotalPages, bool HasPreviousPage, bool HasNextPage);
