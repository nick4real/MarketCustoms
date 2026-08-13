namespace MC.Catalog.Application.DTOs;

public record ProductCatalogViewDto(
    string Id,
    string Title,
    string Description,
    decimal Price,
    string ImageLink,
    string CategoryName,
    List<ProductParameterDto> Parameters);
