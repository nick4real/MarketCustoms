namespace MC.Catalog.Application.DTOs;

public record ListingCatalogViewDto(
    string Id,
    string Title,
    string Description,
    decimal Price,
    string ImageId);
