namespace MC.Catalog.Application.DTOs;

public record ListingCardViewDto(
    string Id,
    string Title,
    string Description,
    decimal Price,
    string ImageId);
