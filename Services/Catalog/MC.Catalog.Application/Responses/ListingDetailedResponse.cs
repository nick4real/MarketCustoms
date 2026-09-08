using MC.Catalog.Application.DTOs;

namespace MC.Catalog.Application.Responses;

public record ListingDetailedResponse(
    Guid OwnerId,
    string Id,
    string Title,
    string Description,
    uint CategoryId,
    CategoryDto Category,
    DateTime CreatedAt,
    decimal Price,
    int Stock,
    List<string> Images,
    List<string> Tags,
    List<ListingParameterDto> Parameters);
