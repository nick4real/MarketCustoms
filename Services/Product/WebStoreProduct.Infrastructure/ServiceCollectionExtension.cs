using Mapster;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.Interfaces.Repositories;
using WebStoreProduct.Application.Interfaces.Services;
using WebStoreProduct.Application.Services;
using WebStoreProduct.Infrastructure.Persistence;
using WebStoreProduct.Infrastructure.Persistence.Repositories;

namespace WebStoreProduct.Infrastructure;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInfrastructure(IConfiguration configuration)
        {
            services.AddMapster();
            MapsterConfig.Configure();

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("ProductDatabase"), builder =>
                {
                    builder.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
                }));

            // Repositories
            services.AddScoped<IProductRepository, ProductRepository>();

            // Services
            services.AddScoped<IProductService, ProductService>();

            // Validators
            //services.AddValidatorsFromAssemblyContaining<UserLoginRequestValidator>();
            //services.AddFluentValidationAutoValidation();

            return services;
        }
    }
}
