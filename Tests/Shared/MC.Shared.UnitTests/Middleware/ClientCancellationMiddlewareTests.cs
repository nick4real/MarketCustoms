using MC.Shared.API.Middleware;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace MC.Shared.UnitTests.Middleware;

public sealed class ClientCancellationMiddlewareTests
{
    [Fact]
    public async Task Client_abort_is_logged_as_information_and_not_rethrown()
    {
        var cts = new CancellationTokenSource();
        var context = new DefaultHttpContext();
        context.Request.Method = "GET";
        context.Request.Path = "/Categories";
        context.RequestAborted = cts.Token;
        cts.Cancel();
        var logger = new ListLogger();
        var middleware = new ClientCancellationMiddleware(
            _ => throw new OperationCanceledException(cts.Token),
            logger);

        await middleware.InvokeAsync(context);

        Assert.Equal(499, context.Response.StatusCode);
        var entry = Assert.Single(logger.Entries);
        Assert.Equal(LogLevel.Information, entry.Level);
        Assert.Contains("GET", entry.Message, StringComparison.Ordinal);
        Assert.Contains("/Categories", entry.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Cancellation_without_client_abort_stays_an_error()
    {
        var context = new DefaultHttpContext();
        var middleware = new ClientCancellationMiddleware(
            _ => throw new OperationCanceledException(),
            new ListLogger());

        await Assert.ThrowsAsync<OperationCanceledException>(() => middleware.InvokeAsync(context));
    }

    private sealed class ListLogger : ILogger<ClientCancellationMiddleware>
    {
        public List<(LogLevel Level, string Message)> Entries { get; } = [];

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => NullScope.Instance;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
            => Entries.Add((logLevel, formatter(state, exception)));

        private sealed class NullScope : IDisposable
        {
            public static readonly NullScope Instance = new();

            public void Dispose()
            {
            }
        }
    }
}
