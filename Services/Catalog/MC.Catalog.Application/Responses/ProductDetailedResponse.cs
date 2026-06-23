using MC.Catalog.Domain.Entities;

namespace MC.Catalog.Application.Responses;

public record ProductDetailedResponse(
    uint Id,
    string Title,
    string Description,
    uint CategoryId,
    Category Category,
    DateTime CreatedAt,
    decimal Price,
    int StockQuantity,
    List<string> ImageLinks);