namespace MC.Shared.Application.Requests;

public record PaginationParams(int PageIndex = 1, int PageSize = 12);
