using MC.Shared.Application.Common;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Shared.API;

public static class AuthorizationExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddPermissionAuthorization(params string[] permissions)
            => services.AddAuthorization(options =>
            {
                foreach (var permission in permissions)
                {
                    options.AddPolicy(permission, policy =>
                        policy.RequireClaim(AuthClaimTypes.Permissions, permission));
                }
            });
    }
}
