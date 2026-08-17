using Aspire.Hosting;
using Aspire.Hosting.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Ordering.IntegrationTests.Fixtures;

public sealed class OrderingAppFixture : IAsyncLifetime
{
    public const string ServiceName = "orderingService";

    private DistributedApplication? _app;

    public DistributedApplication App => _app
        ?? throw new InvalidOperationException("Ordering integration host has not started.");

    public async ValueTask InitializeAsync()
    {
        try
        {
            var builder = await DistributedApplicationTestingBuilder.CreateAsync<Projects.AspireApp_AppHost>(
                ["MarketCustoms:TestService=ordering"]);

            builder.Services.ConfigureHttpClientDefaults(http => http.AddStandardResilienceHandler());

            _app = await builder.BuildAsync();
            await _app.StartAsync();

            using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(3));
            await _app.ResourceNotifications.WaitForResourceHealthyAsync(ServiceName, cts.Token);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Ordering integration host failed to start. This suite hosts only the Ordering API.",
                ex);
        }
    }

    public HttpClient CreateClient() => App.CreateHttpClient(ServiceName);

    public async ValueTask DisposeAsync()
    {
        if (_app is not null)
        {
            await _app.DisposeAsync();
        }
    }
}

[CollectionDefinition(Name)]
public sealed class OrderingAppCollection : ICollectionFixture<OrderingAppFixture>
{
    public const string Name = "OrderingApp";
}
