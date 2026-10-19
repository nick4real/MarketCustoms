using Bogus;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Enums;
using MC.Catalog.Infrastructure.Models;
using MC.Shared.Infrastructure.Seeding;

namespace MC.Catalog.Infrastructure.Persistence.Seeding;

public sealed class ListingFactory
{
    private readonly int _randomSeed;
    private readonly DateTimeOffset _referenceDate;
    private readonly IReadOnlyList<uint> _categoryIds;
    private readonly IReadOnlyList<string> _imagePool;

    public ListingFactory(
        int randomSeed,
        DateTimeOffset referenceDate,
        IReadOnlyList<uint> categoryIds,
        IReadOnlyList<string> imagePool)
    {
        if (categoryIds.Count == 0)
        {
            throw new ArgumentException("At least one category is required.", nameof(categoryIds));
        }

        _randomSeed = randomSeed;
        _referenceDate = referenceDate;
        _categoryIds = categoryIds;
        _imagePool = imagePool;
    }

    public IEnumerable<ListingBson> ForSeller(int sellerIndex, int count)
        => Enumerable.Range(0, count).Select(listingIndex => Create(sellerIndex, listingIndex));

    public ListingBson Create(int sellerIndex, int listingIndex)
    {
        var f = new Faker { Random = new Randomizer(SeedIds.DeriveSeed(_randomSeed, $"listing:{sellerIndex}:{listingIndex}")) };
        var condition = f.Random.Enum<Condition>();

        return new ListingBson
        {
            OwnerGuid = SeedIds.Seller(sellerIndex),
            Title = f.Commerce.ProductName(),
            Description = $"{f.Commerce.ProductDescription()} {f.Lorem.Sentences(2)}",
            Condition = condition,
            CategoryId = _categoryIds[f.Random.Int(0, _categoryIds.Count - 1)],
            CreatedAt = f.Date.RecentOffset(90, _referenceDate),
            Price = Math.Round(f.Random.Decimal(5m, 3000m), 2),
            StockQuantity = condition == Condition.New ? f.Random.Int(1, 10) : 1,
            ImageLinks = f.PickRandom(_imagePool, Math.Min(3, _imagePool.Count)).ToList(),
            Tags = f.Make(3, () => f.Commerce.ProductAdjective().ToLowerInvariant()).Distinct().ToList(),
            Parameters =
            [
                new Param { Name = "Brand", Value = f.Company.CompanyName() },
                new Param { Name = "Material", Value = f.Commerce.ProductMaterial() },
                new Param { Name = "Color", Value = f.Commerce.Color() }
            ]
        };
    }
}
