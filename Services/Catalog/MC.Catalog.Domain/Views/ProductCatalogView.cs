using MC.Catalog.Domain.Entities;

namespace MC.Catalog.Domain.Views;

public record ProductCatalogView(
    uint Id,
    string Title,
    string Description,
    decimal Price,
    ImageLink? Image);
