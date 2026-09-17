using Microsoft.Extensions.DependencyInjection;

namespace MC.Delivering.Application;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApplication()
        {
            return services;
        }
    }
}
