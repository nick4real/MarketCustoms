using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using WebStoreUser.Infrastructure.Persistence;

namespace WebStoreUser.Infrastructure;

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

            // Repositories

            // Services

            // Validators
            //services.AddValidatorsFromAssemblyContaining<UserLoginRequestValidator>();
            services.AddFluentValidationAutoValidation();

            return services;
        }
    }
}
