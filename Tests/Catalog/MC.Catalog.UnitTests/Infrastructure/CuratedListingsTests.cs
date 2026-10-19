using MC.Catalog.Domain.Entities;
using MC.Catalog.Infrastructure.Persistence.Seeding;

namespace MC.Catalog.UnitTests.Infrastructure;

public sealed class CuratedListingsTests
{
    [Fact]
    public void Fixture_loads_from_embedded_resource()
    {
        var curated = CuratedListings.Load();

        Assert.NotEmpty(curated);
        Assert.All(curated, listing =>
        {
            Assert.False(string.IsNullOrWhiteSpace(listing.Title));
            Assert.NotEmpty(listing.ImageLinks);
            Assert.True(listing.Price > 0);
        });
    }

    [Fact]
    public void Every_curated_category_exists_in_the_category_tree()
    {
        var categoryNames = Flatten(CategoryTree.Create()).Select(c => c.Name).ToHashSet();

        Assert.All(CuratedListings.Load(), listing => Assert.Contains(listing.Category, categoryNames));
    }

    [Fact]
    public void Category_tree_names_are_unique()
    {
        var names = Flatten(CategoryTree.Create()).Select(c => c.Name).ToList();

        Assert.Equal(names.Count, names.Distinct().Count());
    }

    private static IEnumerable<Category> Flatten(IEnumerable<Category> categories)
        => categories.SelectMany(c => Flatten(c.ChildCategories ?? []).Prepend(c));
}
