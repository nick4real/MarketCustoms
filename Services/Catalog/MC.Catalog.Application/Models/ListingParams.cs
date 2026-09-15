namespace MC.Catalog.Application.Models;

public record ListingParams(
    uint? CategoryId,
    string? Title,
    List<Tuple<string, string>>? Parameters);
    // TODO: string/enum Sort