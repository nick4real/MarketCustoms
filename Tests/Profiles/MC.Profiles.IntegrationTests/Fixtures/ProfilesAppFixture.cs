using System.Net.Http.Headers;
using Aspire.Hosting;
using Aspire.Hosting.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Profiles.IntegrationTests.Fixtures;

public sealed class ProfilesAppFixture : IAsyncLifetime
{
    public const string ServiceName = "profilesService";
    public const string LocalTestScheme = "LocalTest";
    public const string LocalTestUserId = "local-test-user";

    private DistributedApplication? _app;

    public DistributedApplication App => _app
        ?? throw new InvalidOperationException("Profiles integration host has not started.");

    public async ValueTask InitializeAsync()
    {
        try
        {
            var builder = await DistributedApplicationTestingBuilder.CreateAsync<Projects.AspireApp_AppHost>(
                ["MarketCustoms:TestService=profiles"]);

            builder.Services.ConfigureHttpClientDefaults(http => http.AddStandardResilienceHandler());

            _app = await builder.BuildAsync();
            await _app.StartAsync();

            using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(6));
            await _app.ResourceNotifications.WaitForResourceHealthyAsync(ServiceName, cts.Token);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Profiles integration host failed to start isolated SQL Server. Ensure Docker is running. This suite does not use the shared development database.",
                ex);
        }
    }

    public HttpClient CreateAnonymousClient() => App.CreateHttpClient(ServiceName);

    public HttpClient CreateAuthenticatedClient(string userId = LocalTestUserId)
    {
        var client = CreateAnonymousClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(LocalTestScheme, userId);
        return client;
    }

    public async ValueTask DisposeAsync()
    {
        if (_app is not null)
        {
            await _app.DisposeAsync();
        }
    }
}

[CollectionDefinition(Name)]
public sealed class ProfilesAppCollection : ICollectionFixture<ProfilesAppFixture>
{
    public const string Name = "ProfilesApp";
}
