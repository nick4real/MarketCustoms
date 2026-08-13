namespace MC.Catalog.Application.Models;

public record ProductParams(
    uint? CategoryId,
    string? Title,
    List<ProductParameterFilter>? Parameters);
