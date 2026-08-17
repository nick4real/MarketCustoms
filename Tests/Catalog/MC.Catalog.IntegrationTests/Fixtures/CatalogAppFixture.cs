using System.Net.Http.Headers;
using Aspire.Hosting;
using Aspire.Hosting.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Catalog.IntegrationTests.Fixtures;

public sealed class CatalogAppFixture : IAsyncLifetime
{
    public const string ServiceName = "catalogService";
    public const string LocalTestScheme = "LocalTest";
    public const string LocalTestUserId = "local-test-user";

    private DistributedApplication? _app;

    public DistributedApplication App => _app
        ?? throw new InvalidOperationException("Catalog integration host has not started.");

    public async ValueTask InitializeAsync()
    {
        try
        {
            var builder = await DistributedApplicationTestingBuilder.CreateAsync<Projects.MC_Aspire_AppHost>(
                ["MarketCustoms:TestService=catalog"]);

            builder.Services.ConfigureHttpClientDefaults(http => http.AddStandardResilienceHandler());

            _app = await builder.BuildAsync();
            await _app.StartAsync();

            using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(6));
            await _app.ResourceNotifications.WaitForResourceHealthyAsync(ServiceName, cts.Token);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Catalog integration host failed to start isolated SQL Server/MongoDB. Ensure Docker is running. This suite does not use the shared development database.",
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
public sealed class CatalogAppCollection : ICollectionFixture<CatalogAppFixture>
{
    public const string Name = "CatalogApp";
}
