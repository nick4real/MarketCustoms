using FluentValidation;
using FluentValidation.AspNetCore;
using Mapster;
using Microsoft.Extensions.DependencyInjection;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Services;
using MC.Catalog.Application.Validators;

namespace MC.Catalog.Application;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApplication()
        {
            services.AddMapster();

            // Services
            services.AddScoped<IProductService, ProductService>();

            // Validators
            services.AddValidatorsFromAssemblyContaining<ProductParamsValidator>();
            services.AddFluentValidationAutoValidation();

            return services;
        }
    }
}
