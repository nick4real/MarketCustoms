using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Infrastructure.Persistence;
using MC.Catalog.Infrastructure.Persistence.Repositories;

namespace MC.Catalog.Infrastructure;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInfrastructure(IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("CatalogDatabase"), builder =>
                {
                    builder.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
                }));

            // Repositories
            services.AddScoped<IProductRepository, ProductRepository>();

            return services;
        }
    }
}
