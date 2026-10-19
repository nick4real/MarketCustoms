using MC.Shared.Infrastructure.Seeding;

namespace MC.Profiles.UnitTests.Infrastructure;

public sealed class SeedIdsTests
{
    [Fact]
    public void Ids_are_stable_across_processes()
    {
        // Other services persist references to these values; changing them orphans seeded data.
        Assert.Equal(new Guid("29b6e1e8-5da8-509e-9399-d86cd9a6d2c7"), SeedIds.Seller(0));
        Assert.Equal(5, SeedIds.Seller(0).Version);
    }

    [Fact]
    public void Ids_differ_by_kind_and_index()
    {
        Assert.NotEqual(SeedIds.Seller(0), SeedIds.Buyer(0));
        Assert.NotEqual(SeedIds.Seller(0), SeedIds.Seller(1));
    }

    [Fact]
    public void Derived_seeds_are_deterministic_and_key_specific()
    {
        Assert.Equal(SeedIds.DeriveSeed(7, "a"), SeedIds.DeriveSeed(7, "a"));
        Assert.NotEqual(SeedIds.DeriveSeed(7, "a"), SeedIds.DeriveSeed(7, "b"));
        Assert.NotEqual(SeedIds.DeriveSeed(7, "a"), SeedIds.DeriveSeed(8, "a"));
    }
}
