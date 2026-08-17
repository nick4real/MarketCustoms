using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.Extensions.DependencyInjection;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Services;
using MC.Catalog.Application.Validators;
using MC.Catalog.Application.Validators.Requests;

namespace MC.Catalog.Application;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApplication()
        {
            // Services
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<ICategoryService, CategoryService>();

            // Validators
            services.AddValidatorsFromAssemblyContaining<ProductParamsValidator>();
            services.AddValidatorsFromAssemblyContaining<CreateProductValidator>();
            services.AddFluentValidationAutoValidation();

            return services;
        }
    }
}
