using Mapster;
using Microsoft.Extensions.DependencyInjection;
using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.Interfaces.Services;
using WebStoreProduct.Application.Services;

namespace WebStoreProduct.Application;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApplication()
        {
            services.AddMapster();
            MapsterConfig.Configure();

            // Services
            services.AddScoped<IProductService, ProductService>();

            return services;
        }
    }
}
