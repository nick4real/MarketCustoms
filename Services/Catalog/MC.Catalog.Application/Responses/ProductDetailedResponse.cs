using MC.Catalog.Domain.Entities;
using MC.Catalog.Application.DTOs;

namespace MC.Catalog.Application.Responses;

public record ProductDetailedResponse(
    string Id,
    string Title,
    string Description,
    uint CategoryId,
    Category Category,
    DateTime CreatedAt,
    decimal Price,
    int StockQuantity,
    List<string> ImageLinks,
    List<string> Tags,
    List<ProductParameterDto> Parameters);