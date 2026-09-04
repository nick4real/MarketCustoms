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
    }
}
