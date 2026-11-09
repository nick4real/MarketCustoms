using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace MC.Shared.API.Middleware;

public sealed class ClientCancellationMiddleware(
    RequestDelegate next,
    ILogger<ClientCancellationMiddleware> logger)
{
    private const int ClientClosedRequestStatusCode = 499;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            logger.LogInformation(
                "HTTP {Method} {Path} was canceled by the client.",
                context.Request.Method,
                context.Request.Path);

            if (!context.Response.HasStarted)
                context.Response.StatusCode = ClientClosedRequestStatusCode;
        }
    }
}
