namespace MC.Aspire.AppHost.Parameters;

internal record Auth0ManagementParameters(
    IResourceBuilder<ParameterResource> ClientId,
    IResourceBuilder<ParameterResource> ClientSecret);