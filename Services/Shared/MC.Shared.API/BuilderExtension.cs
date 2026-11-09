using Auth0.AspNetCore.Authentication.Api;
using MC.Shared.API.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace MC.Shared.API;

public static class BuilderExtension
{
    extension<TBuilder>(TBuilder builder) where TBuilder : IHostApplicationBuilder
    {
        public TBuilder AddAuthenticationDefaults()
        {
            var useLocalTestIdentity = builder.Configuration.GetValue("Authentication:UseLocalTestIdentity", false);
            if (useLocalTestIdentity)
            {
                builder.Services.AddAuthentication(LocalTestAuthenticationHandler.SchemeName)
                    .AddScheme<AuthenticationSchemeOptions, LocalTestAuthenticationHandler>(
                        LocalTestAuthenticationHandler.SchemeName, _ => { });
            }
            else
            {
                builder.Services.AddAuth0ApiAuthentication(builder.Configuration.GetSection("Auth0"));
            }
            return builder;
        }
    }
}
