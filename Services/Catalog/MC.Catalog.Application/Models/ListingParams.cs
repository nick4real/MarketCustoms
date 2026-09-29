using MC.Catalog.Domain.Enums;

namespace MC.Catalog.Application.Models;

public record ListingParams(
    uint? CategoryId,
    string? Title,
    string? Sort,
    Condition? Condition,
    List<Tuple<string, string>>? Parameters);