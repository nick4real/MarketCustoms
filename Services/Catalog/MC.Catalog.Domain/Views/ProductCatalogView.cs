namespace MC.Catalog.Domain.Views;

public record ProductCatalogView(
    string Id,
    string Title,
    string Description,
    decimal Price,
    string ImageLink,
    string CategoryName,
    List<ProductParameterView> Parameters);
