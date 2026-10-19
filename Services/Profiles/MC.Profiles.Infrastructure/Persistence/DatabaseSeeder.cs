using MC.Profiles.Infrastructure.Options;
using MC.Profiles.Infrastructure.Persistence.Seeding;
using MC.Shared.Infrastructure.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace MC.Profiles.Infrastructure.Persistence;

public class DatabaseSeeder(
    AppRelationalDbContext context,
    IOptions<SeedingOptions> options,
    IOptions<ProfilesSeedingOptions> profilesSeedingOptions)
    : RelationalDatabaseSeeder<AppRelationalDbContext>(context, SchemaStrategy.EnsureCreated)
{
    public override async Task<bool> IsEmptyAsync(CancellationToken ct)
        => !await Context.Profiles.AnyAsync(ct);

    public override async Task SeedAsync(CancellationToken ct)
    {
        var seeding = options.Value;
        var devUserOptions = profilesSeedingOptions.Value.DevUser;
        var factory = new ProfileFactory(seeding.RandomSeed, DateTimeOffset.UtcNow);

        var sellers = Enumerable.Range(0, seeding.Population.Sellers).Select(factory.CreateSeller).ToList();
        var buyers = Enumerable.Range(0, seeding.Population.Buyers).Select(factory.CreateBuyer);

        if (sellers.Count > 0 && !string.IsNullOrWhiteSpace(devUserOptions.ExternalUserId))
        {
            var devUser = sellers[0];
            devUser.ExternalUserId = devUserOptions.ExternalUserId;
            devUser.DisplayName = devUserOptions.DisplayName ?? devUser.DisplayName;
            devUser.Email = devUserOptions.Email ?? devUser.Email;
        }

        await Context.Profiles.AddRangeAsync(sellers);
        await Context.Profiles.AddRangeAsync(buyers);
        await Context.SaveChangesAsync(ct);
    }
}
