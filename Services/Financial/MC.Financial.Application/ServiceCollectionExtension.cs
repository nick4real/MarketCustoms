using Microsoft.Extensions.DependencyInjection;

namespace MC.Financial.Application;

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
