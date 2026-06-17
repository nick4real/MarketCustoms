using MC.Catalog.Domain.Entities;

namespace MC.Catalog.Domain.Views;

public record ProductCatalogView(
    string Id,
    string Title,
    string Description,
    decimal Price,
    ImageLink? Image);
