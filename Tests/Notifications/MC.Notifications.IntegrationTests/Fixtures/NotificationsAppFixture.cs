using Aspire.Hosting;
using Aspire.Hosting.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Notifications.IntegrationTests.Fixtures;

public sealed class NotificationsAppFixture : IAsyncLifetime
{
    public const string ServiceName = "notificationsService";

    private DistributedApplication? _app;

    public DistributedApplication App => _app
        ?? throw new InvalidOperationException("Notifications integration host has not started.");

    public async ValueTask InitializeAsync()
    {
        try
        {
            var builder = await DistributedApplicationTestingBuilder.CreateAsync<Projects.MC_Aspire_AppHost>(
                ["MarketCustoms:TestService=notifications"]);

            builder.Services.ConfigureHttpClientDefaults(http => http.AddStandardResilienceHandler());

            _app = await builder.BuildAsync();
            await _app.StartAsync();

            using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(3));
            await _app.ResourceNotifications.WaitForResourceHealthyAsync(ServiceName, cts.Token);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                "Notifications integration host failed to start. This suite hosts only the Notifications API.",
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
public sealed class NotificationsAppCollection : ICollectionFixture<NotificationsAppFixture>
{
    public const string Name = "NotificationsApp";
}
