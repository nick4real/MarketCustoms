using MC.Profiles.Application.Interfaces.Services;
using MC.Profiles.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Profiles.Application;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApplication()
        {
            // Services
            services.AddScoped<IProfileService, ProfileService>();
            // Validators

            return services;
        }
    }
}
