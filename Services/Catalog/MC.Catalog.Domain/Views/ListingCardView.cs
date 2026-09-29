namespace MC.Catalog.Domain.Views;

public record ListingCardView(
    string Id,
    string Title,
    string Description,
    string Condition,
    decimal Price,
    string ImageLink);
