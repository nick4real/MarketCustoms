using Mapster;
using Microsoft.Extensions.DependencyInjection;
using WebStoreProduct.Application.Common;

namespace WebStoreProduct.Application;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApplication()
        {
            services.AddMapster();
            MapsterConfig.Configure();

            return services;
        }
    }
}
