namespace MC.Catalog.Application.Models;

public record ListingParams(
    uint? CategoryId,
    string? Title,
    string? Sort,
    List<Tuple<string, string>>? Parameters);