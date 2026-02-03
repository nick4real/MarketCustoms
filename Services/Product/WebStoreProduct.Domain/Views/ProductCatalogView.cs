using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Domain.Views;

public record ProductCatalogView(
    uint Id,
    string Title,
    string Description,
    decimal Price,
    ImageLink? Image);
