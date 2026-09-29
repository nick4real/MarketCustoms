namespace MC.Catalog.Application.DTOs;

public record ListingCardViewDto(
    string Id,
    string Title,
    string Description,
    string Condition,
    decimal Price,
    string ImageId);
