using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Application.Interfaces.Services;
using MC.Profiles.Infrastructure.Options;
using MC.Profiles.Infrastructure.Persistence;
using MC.Profiles.Infrastructure.Persistence.Repositories;
using MC.Profiles.Infrastructure.Services;
using MC.Shared.Application.Interfaces.Repositories;
using MC.Shared.Application.Interfaces.Services;
using MC.Shared.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Profiles.Infrastructure;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInfrastructure(IConfiguration configuration)
        {
            services.AddDbContext<AppRelationalDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("profilesSqlDatabase"), builder =>
                {
                    builder.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
                }));

            services.AddHttpClient(Auth0ManagementIdentityService.HttpClientName);
            services.AddHttpContextAccessor();

            // Options
            services.Configure<Auth0ManagementOptions>(options =>
            {
                options.Domain = configuration["Auth0:Domain"] ?? string.Empty;
                options.ClientId = configuration["Auth0:Management:ClientId"] ?? string.Empty;
                options.ClientSecret = configuration["Auth0:Management:ClientSecret"] ?? string.Empty;
            });

            // Repositories
            services.AddScoped<IProfileRepository, ProfileRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Services
            services.AddScoped<ICurrentUserService, Auth0CurrentUserService>();
            var useLocalTestIdentity = configuration.GetValue("Authentication:UseLocalTestIdentity", false);
            if (useLocalTestIdentity)
            {
                services.AddScoped<IIdentityService, NoOpIdentityService>();
            }
            else
            {
                services.AddScoped<IIdentityService, Auth0ManagementIdentityService>();
            }

            return services;
        }
    }
}
