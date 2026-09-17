namespace MC.Catalog.Domain.Views;

public record ListingCardView(
    string Id,
    string Title,
    string Description,
    decimal Price,
    string ImageLink);
