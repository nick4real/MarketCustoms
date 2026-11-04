using MC.Shared.Infrastructure.Interfaces.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MC.Shared.Infrastructure.Seeding;

public static class SeedingExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddDatabaseSeeder<TSeeder>(IConfiguration configuration)
            where TSeeder : class, IDatabaseSeeder
        {
            services.AddSeedingOptions(configuration);
            services.AddScoped<IDatabaseSeeder, TSeeder>();
            return services;
        }

        public IServiceCollection AddSchemaOnlySeeder<TContext>(
            IConfiguration configuration,
            SchemaStrategy schemaStrategy = SchemaStrategy.EnsureCreated)
            where TContext : DbContext
        {
            services.AddSeedingOptions(configuration);
            services.AddScoped<IDatabaseSeeder>(sp =>
                new SchemaOnlyDatabaseSeeder<TContext>(sp.GetRequiredService<TContext>(), schemaStrategy));
            return services;
        }

        private void AddSeedingOptions(IConfiguration configuration)
        {
            services.AddOptions<SeedingOptions>()
                .Bind(configuration.GetSection(SeedingOptions.SectionName))
                .Validate(o => IsPopulation(o.Population.Sellers) && IsPopulation(o.Population.Buyers),
                    $"Seeding:Population counts must be between 0 and {SeedingOptions.MaxPopulation}.")
                .ValidateOnStart();
        }
    }

    extension(IHost app)
    {
        public async Task SeedDatabaseAsync(CancellationToken ct = default)
        {
            await using var scope = app.Services.CreateAsyncScope();
            var options = scope.ServiceProvider.GetRequiredService<IOptions<SeedingOptions>>().Value;
            var seeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();
            var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("MC.Seeding");

            await seeder.PrepareSchemaAsync(options.Mode == SeedingMode.Reset, ct);

            if (options.Mode == SeedingMode.None)
            {
                return;
            }

            if (options.Mode == SeedingMode.IfEmpty && !await seeder.IsEmptyAsync(ct))
            {
                logger.LogInformation("Seeding skipped: store already contains data.");
                return;
            }

            logger.LogInformation(
                "Seeding ({Mode}) with random seed {RandomSeed}, {Sellers} sellers, {Buyers} buyers.",
                options.Mode, options.RandomSeed, options.Population.Sellers, options.Population.Buyers);

            await seeder.SeedAsync(ct);
        }
    }

    private static bool IsPopulation(int count) => count is >= 0 and <= SeedingOptions.MaxPopulation;
}
