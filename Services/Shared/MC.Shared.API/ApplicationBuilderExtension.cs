using MC.Shared.API.Middleware;
using Microsoft.AspNetCore.Builder;

namespace MC.Shared.API;

public static class ApplicationBuilderExtension
{
    extension(IApplicationBuilder app)
    {
        public IApplicationBuilder UseClientCancellationLogging()
            => app.UseMiddleware<ClientCancellationMiddleware>();
    }
}
