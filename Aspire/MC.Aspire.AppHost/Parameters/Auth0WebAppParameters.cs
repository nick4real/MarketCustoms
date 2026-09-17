namespace MC.Aspire.AppHost.Parameters;

public record Auth0WebAppParameters(
    IResourceBuilder<ParameterResource> Domain,
    IResourceBuilder<ParameterResource> Audience,
    IResourceBuilder<ParameterResource> ClientId);
