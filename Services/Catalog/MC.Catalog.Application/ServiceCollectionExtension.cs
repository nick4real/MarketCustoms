using FluentValidation;
using FluentValidation.AspNetCore;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Services;
using MC.Catalog.Application.Validators;
using MC.Catalog.Application.Validators.Requests;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Catalog.Application;

public static class ServiceCollectionExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApplication()
        {
            // Services
            services.AddScoped<IListingService, ListingService>();
            services.AddScoped<ICategoryService, CategoryService>();

            // Validators
            services.AddValidatorsFromAssemblyContaining<ListingParamsValidator>();
            services.AddValidatorsFromAssemblyContaining<CreateListingValidator>();
            services.AddFluentValidationAutoValidation();

            return services;
        }
    }
}
