using MC.Aspire.AppHost.Parameters;

namespace MC.Aspire.AppHost;

internal static class ServiceParameterExtension
{
    extension<T>(IResourceBuilder<T> builder) where T : IResourceWithEnvironment
    {
        public IResourceBuilder<T> WithAuth0Parameters(Auth0Parameters parameters)
        {
            return builder
                .WithEnvironment("Auth0:Domain", parameters.Domain)
                .WithEnvironment("Auth0:Audience", parameters.Audience);
        }

        public IResourceBuilder<T> WithAuth0ManagementParameters(Auth0ManagementParameters parameters)
        {
            return builder
                .WithEnvironment("Auth0:Management:ClientId", parameters.ClientId)
                .WithEnvironment("Auth0:Management:ClientSecret", parameters.ClientSecret);
        }

        public IResourceBuilder<T> WithAuth0WebAppParameters(Auth0WebAppParameters parameters)
        {
            return builder
                .WithEnvironment("VITE_AUTH0_DOMAIN", parameters.Domain)
                .WithEnvironment("VITE_AUTH0_AUDIENCE", parameters.Audience)
                .WithEnvironment("VITE_AUTH0_CLIENT_ID", parameters.ClientId);
        }
    }
}
