namespace MC.Shared.Infrastructure.Interfaces.Persistence;

public interface IDatabaseSeeder
{
    Task PrepareSchemaAsync(bool reset, CancellationToken ct);
    Task<bool> IsEmptyAsync(CancellationToken ct);
    Task SeedAsync(CancellationToken ct);
}
