using MC.Shared.Infrastructure.Interfaces.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MC.Shared.Infrastructure.Seeding;

public enum SchemaStrategy
{
    EnsureCreated,
    Migrations
}

public abstract class RelationalDatabaseSeeder<TContext>(TContext context, SchemaStrategy schemaStrategy) : IDatabaseSeeder
    where TContext : DbContext
{
    protected TContext Context { get; } = context;
    protected SchemaStrategy SchemaStrategy { get; } = schemaStrategy;

    public virtual async Task PrepareSchemaAsync(bool reset, CancellationToken ct)
    {
        var executionStrategy = Context.Database.CreateExecutionStrategy();

        await executionStrategy.ExecuteAsync(async () =>
        {
            // Applied migrations unknown to the code (e.g. after a branch switch) cannot be migrated forward.
            if (reset || (SchemaStrategy == SchemaStrategy.Migrations && await HasUnknownAppliedMigrationsAsync(ct)))
            {
                await Context.Database.EnsureDeletedAsync(ct);
            }

            if (SchemaStrategy == SchemaStrategy.Migrations)
            {
                await Context.Database.MigrateAsync(ct);
            }
            else
            {
                await Context.Database.EnsureCreatedAsync(ct);
            }
        });
    }

    public abstract Task<bool> IsEmptyAsync(CancellationToken ct);

    public abstract Task SeedAsync(CancellationToken ct);

    private async Task<bool> HasUnknownAppliedMigrationsAsync(CancellationToken ct)
    {
        var known = Context.Database.GetMigrations();
        var applied = await Context.Database.GetAppliedMigrationsAsync(ct);
        return applied.Except(known).Any();
    }
}

public sealed class SchemaOnlyDatabaseSeeder<TContext>(TContext context, SchemaStrategy schemaStrategy)
    : RelationalDatabaseSeeder<TContext>(context, schemaStrategy)
    where TContext : DbContext
{
    public override Task<bool> IsEmptyAsync(CancellationToken ct) => Task.FromResult(true);

    public override Task SeedAsync(CancellationToken ct) => Task.CompletedTask;
}
