using Microsoft.Extensions.DependencyInjection;

namespace MC.Profiles.Application;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApplication()
        {
            // Services
            // Validators

            return services;
        }
    }
}
