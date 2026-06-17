using MC.Catalog.Domain.Entities;

namespace MC.Catalog.Application.DTOs;

public record ProductCatalogViewDto(
    uint Id,
    string Title,
    string Description,
    decimal Price,
    ImageLink? Image);
