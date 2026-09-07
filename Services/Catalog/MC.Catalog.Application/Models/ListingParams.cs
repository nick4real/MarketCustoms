namespace MC.Catalog.Application.Models;

public record ListingParams(
    uint? CategoryId,
    string? Title,
    List<ListingParameterFilter>? Parameters);
