using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Infrastructure.Options;
using MC.Catalog.Infrastructure.Persistence;
using MC.Catalog.Infrastructure.Persistence.Repositories;
using MC.Shared.Application.Interfaces.Services;
using MC.Shared.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Catalog.Infrastructure;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInfrastructure(IConfiguration configuration)
        {
            services.AddDbContext<AppRelationalDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("catalogSqlDatabase"), builder =>
                {
                    builder.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
                }));

            services.AddSingleton<AppMongoDbContext>();

            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUserService, Auth0CurrentUserService>();

            // Options
            services.Configure<MongoDbOptions>(configuration);

            // Repositories
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();

            return services;
        }
    }
}
