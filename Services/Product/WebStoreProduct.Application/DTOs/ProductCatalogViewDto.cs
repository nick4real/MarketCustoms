using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Application.DTOs;

public record ProductCatalogViewDto(
    uint Id,
    string Title,
    string Description,
    decimal Price,
    ImageLink? Image);
