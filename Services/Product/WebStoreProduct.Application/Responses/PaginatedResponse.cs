namespace WebStoreProduct.Application.Responses;

public record PaginatedResponse<T>(T[] Items, int Count, int PageIndex, int TotalPages, bool HasPreviousPage, bool HasNextPage);
