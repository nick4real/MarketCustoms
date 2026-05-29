using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Application.Responses;

public record ProductDetailedResponse(
    uint Id,
    string Title,
    string Description,
    uint CategoryId,
    Category Category,
    DateTime CreatedAt,
    decimal Price,
    int StockQuantity,
    List<ImageLink> Images);