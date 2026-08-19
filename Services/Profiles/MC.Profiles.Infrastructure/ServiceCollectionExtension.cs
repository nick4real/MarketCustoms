using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Application.Interfaces.Services;
using MC.Profiles.Infrastructure.Options;
using MC.Profiles.Infrastructure.Persistence;
using MC.Profiles.Infrastructure.Persistence.Repositories;
using MC.Profiles.Infrastructure.Services;
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

            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUserService, CurrentUserService>();

            services.Configure<Auth0ManagementOptions>(options =>
            {
                options.Domain = configuration["Auth0:Domain"] ?? string.Empty;
                options.ClientId = configuration["Auth0:Management:ClientId"] ?? string.Empty;
                options.ClientSecret = configuration["Auth0:Management:ClientSecret"] ?? string.Empty;
            });

            services.AddHttpClient(Auth0ManagementSellerIdentityService.HttpClientName);

            services.AddScoped<IProfileRepository, ProfileRepository>();
            services.AddScoped<ISellerApplicationRepository, SellerApplicationRepository>();
            services.AddScoped<ISellerProfileRepository, SellerProfileRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            var useLocalTestIdentity = configuration.GetValue("Authentication:UseLocalTestIdentity", false);
            if (useLocalTestIdentity)
            {
                services.AddScoped<ISellerIdentityService, NoOpSellerIdentityService>();
            }
            else
            {
                services.AddScoped<ISellerIdentityService, Auth0ManagementSellerIdentityService>();
            }

            return services;
        }
    }
}
