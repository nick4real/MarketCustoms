namespace MC.Aspire.AppHost.Parameters;

internal record Auth0Parameters(
    IResourceBuilder<ParameterResource> Domain, 
    IResourceBuilder<ParameterResource> Audience);