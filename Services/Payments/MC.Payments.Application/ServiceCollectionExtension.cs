using Microsoft.Extensions.DependencyInjection;

namespace MC.Payments.Application;

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
