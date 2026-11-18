using MC.Profiles.Infrastructure.Options;
using MC.Profiles.Infrastructure.Services;
using MC.Shared.Application.Common;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text;

namespace MC.Profiles.UnitTests.Infrastructure;

public sealed class Auth0ManagementIdentityServiceTests
{
    private const string AccessToken = "management-access-token";
    private const string ClientSecret = "management-client-secret";

    [Fact]
    public async Task GrantSellerAsync_logs_status_and_body_without_secrets_when_auth0_rejects_request()
    {
        var logger = new ListLogger();
        var service = CreateService(HttpStatusCode.Forbidden, """{"message":"Insufficient scope"}""", logger);

        var result = await service.GrantSellerAsync("auth0|user-1", CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.InternalServerError, result.Error!.Code);
        var entry = Assert.Single(logger.Entries);
        Assert.Equal(LogLevel.Warning, entry.Level);
        Assert.Contains("POST", entry.Message);
        Assert.Contains("/api/v2/users/auth0%7Cuser-1/roles", entry.Message);
        Assert.Contains("403", entry.Message);
        Assert.Contains("Insufficient scope", entry.Message);
        Assert.DoesNotContain(AccessToken, entry.Message);
        Assert.DoesNotContain(ClientSecret, entry.Message);
    }

    [Fact]
    public async Task GrantSellerAsync_logs_nothing_when_auth0_accepts_request()
    {
        var logger = new ListLogger();
        var service = CreateService(HttpStatusCode.NoContent, string.Empty, logger);

        var result = await service.GrantSellerAsync("auth0|user-1", CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(logger.Entries);
    }

    private static Auth0ManagementIdentityService CreateService(
        HttpStatusCode managementStatus,
        string managementBody,
        ListLogger logger)
    {
        var handler = new StubHandler(managementStatus, managementBody);
        var options = Options.Create(new Auth0ManagementOptions
        {
            Domain = "tenant.example.com",
            ClientId = "management-client",
            ClientSecret = ClientSecret,
            SellerRoleId = "rol_seller"
        });
        return new Auth0ManagementIdentityService(new StubHttpClientFactory(handler), options, logger);
    }

    private sealed class StubHandler(HttpStatusCode managementStatus, string managementBody) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var response = request.RequestUri!.AbsolutePath == "/oauth/token"
                ? new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent($$"""{"access_token":"{{AccessToken}}"}""", Encoding.UTF8, "application/json")
                }
                : new HttpResponseMessage(managementStatus)
                {
                    Content = new StringContent(managementBody, Encoding.UTF8, "application/json")
                };
            return Task.FromResult(response);
        }
    }

    private sealed class StubHttpClientFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }

    private sealed record LogEntry(LogLevel Level, string Message);

    private sealed class ListLogger : ILogger<Auth0ManagementIdentityService>
    {
        public List<LogEntry> Entries { get; } = [];

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter) =>
            Entries.Add(new LogEntry(logLevel, formatter(state, exception)));
    }
}
