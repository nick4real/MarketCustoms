using FluentValidation.AspNetCore;
using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Infrastructure.Persistence;
using MC.Profiles.Infrastructure.Persistence.Repositories;
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

            // Options

            // Repositories
            services.AddScoped<IProfileRepository, ProfileRepository>();

            return services;
        }
    }
}
