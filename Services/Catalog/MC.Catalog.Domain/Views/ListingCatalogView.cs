namespace MC.Catalog.Domain.Views;

public record ListingCatalogView(
    string Id,
    string Title,
    string Description,
    decimal Price,
    string ImageLink);
