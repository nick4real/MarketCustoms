using MC.Catalog.Infrastructure.Models;
using MC.Catalog.Infrastructure.Options;
using MC.Catalog.Infrastructure.Persistence.Seeding;
using MC.Shared.Infrastructure.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace MC.Catalog.Infrastructure.Persistence;

public class DatabaseSeeder(
    AppRelationalDbContext relContext,
    AppMongoDbContext docContext,
    IOptions<SeedingOptions> seedingOptions,
    IOptions<CatalogSeedingOptions> catalogSeedingOptions)
    : RelationalDatabaseSeeder<AppRelationalDbContext>(relContext, SchemaStrategy.Migrations)
{
    private const int InsertBatchSize = 1_000;

    public override async Task PrepareSchemaAsync(bool reset, CancellationToken ct)
    {
        await base.PrepareSchemaAsync(reset, ct);

        if (reset)
        {
            await docContext.Listings.DeleteManyAsync(FilterDefinition<ListingBson>.Empty, ct);
        }
    }

    public override async Task<bool> IsEmptyAsync(CancellationToken ct)
        => !await Context.Categories.AnyAsync(ct)
           && await docContext.Listings.EstimatedDocumentCountAsync(cancellationToken: ct) == 0;

    public override async Task SeedAsync(CancellationToken ct)
    {
        var seeding = seedingOptions.Value;
        var catalog = catalogSeedingOptions.Value;
        var now = DateTimeOffset.UtcNow;

        if (!await Context.Categories.AnyAsync(ct))
        {
            Context.Categories.AddRange(CategoryTree.Create());
            await Context.SaveChangesAsync(ct);
        }

        var categories = await Context.Categories
            .AsNoTracking()
            .Select(c => new { c.Id, c.Name, c.ParentCategoryId })
            .ToListAsync(ct);
        var categoryIdsByName = categories.ToDictionary(c => c.Name, c => c.Id);
        var leafCategoryIds = categories
            .Where(c => categories.All(other => other.ParentCategoryId != c.Id))
            .Select(c => c.Id)
            .ToList();

        var curated = CuratedListings.Load();
        var imagePool = curated.SelectMany(c => c.ImageLinks).Distinct().ToList();
        var factory = new ListingFactory(seeding.RandomSeed, now, leafCategoryIds, imagePool);

        var listings = Enumerable.Range(0, seeding.Population.Sellers)
            .SelectMany(sellerIndex => factory.ForSeller(sellerIndex, catalog.ListingsPerSeller));

        if (catalog.IncludeCurated && seeding.Population.Sellers > 0)
        {
            var devSellerId = SeedIds.Seller(0);
            listings = curated
                .Select(c => c.ToBson(devSellerId, ResolveCategoryId(categoryIdsByName, c.Category), now))
                .Concat(listings);
        }

        foreach (var batch in listings.Chunk(InsertBatchSize))
        {
            await docContext.Listings.InsertManyAsync(batch, cancellationToken: ct);
        }
    }

    private static uint ResolveCategoryId(Dictionary<string, uint> categoryIdsByName, string name)
        => categoryIdsByName.TryGetValue(name, out var id)
            ? id
            : throw new InvalidOperationException($"Curated listing references unknown category '{name}'.");
}
