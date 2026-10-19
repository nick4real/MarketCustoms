using System.Text.Json;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Enums;
using MC.Catalog.Infrastructure.Models;

namespace MC.Catalog.Infrastructure.Persistence.Seeding;

public sealed record CuratedListing(
    string Title,
    string Description,
    Condition Condition,
    string Category,
    decimal Price,
    int StockQuantity,
    List<string> ImageLinks,
    List<string> Tags,
    List<Param> Parameters)
{
    public ListingBson ToBson(Guid ownerGuid, uint categoryId, DateTimeOffset createdAt) => new()
    {
        OwnerGuid = ownerGuid,
        Title = Title,
        Description = Description,
        Condition = Condition,
        CategoryId = categoryId,
        CreatedAt = createdAt,
        Price = Price,
        StockQuantity = StockQuantity,
        ImageLinks = [.. ImageLinks],
        Tags = [.. Tags],
        Parameters = Parameters.Select(p => new Param { Name = p.Name, Value = p.Value }).ToList()
    };
}

public static class CuratedListings
{
    private const string ResourceName = "MC.Catalog.Seeding.curated-listings.json";

    public static IReadOnlyList<CuratedListing> Load()
    {
        using var stream = typeof(CuratedListings).Assembly.GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException($"Embedded resource '{ResourceName}' not found.");

        return JsonSerializer.Deserialize<List<CuratedListing>>(stream, JsonSerializerOptions.Web)
            ?? throw new InvalidOperationException($"Embedded resource '{ResourceName}' is empty.");
    }
}
