using MC.Catalog.Infrastructure.Persistence.Seeding;
using MC.Shared.Infrastructure.Seeding;

namespace MC.Catalog.UnitTests.Infrastructure;

public sealed class ListingFactoryTests
{
    private static readonly DateTimeOffset ReferenceDate = new(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
    private static readonly uint[] CategoryIds = [3, 7, 11];
    private static readonly string[] ImagePool = ["photo-a", "photo-b", "photo-c", "photo-d"];

    [Fact]
    public void ForSeller_creates_requested_count_owned_by_seeded_seller()
    {
        var listings = CreateFactory(1337).ForSeller(sellerIndex: 4, count: 15).ToList();

        Assert.Equal(15, listings.Count);
        Assert.All(listings, listing => Assert.Equal(SeedIds.Seller(4), listing.OwnerGuid));
    }

    [Fact]
    public void Same_seed_produces_identical_listings()
    {
        var first = CreateFactory(42).ForSeller(2, 5).ToList();
        var second = CreateFactory(42).ForSeller(2, 5).ToList();

        Assert.Equivalent(first, second, strict: true);
    }

    [Fact]
    public void Generated_values_stay_within_provided_pools()
    {
        var listings = CreateFactory(1337).ForSeller(0, 50).ToList();

        Assert.All(listings, listing =>
        {
            Assert.Contains(listing.CategoryId, CategoryIds);
            Assert.Equal(3, listing.ImageLinks.Count);
            Assert.All(listing.ImageLinks, image => Assert.Contains(image, ImagePool));
            Assert.InRange(listing.Price, 5m, 3000m);
            Assert.InRange(listing.CreatedAt, ReferenceDate.AddDays(-90), ReferenceDate);
            Assert.True(listing.StockQuantity >= 1);
            Assert.False(string.IsNullOrWhiteSpace(listing.Title));
        });
    }

    [Fact]
    public void Requires_at_least_one_category()
    {
        Assert.Throws<ArgumentException>(() => new ListingFactory(1, ReferenceDate, [], ImagePool));
    }

    private static ListingFactory CreateFactory(int seed) => new(seed, ReferenceDate, CategoryIds, ImagePool);
}
