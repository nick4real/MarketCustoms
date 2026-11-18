using MC.Shared.Application.Common;
using MC.Shared.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace MC.Shared.Infrastructure.Services;

public class Auth0CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor?.HttpContext?.User;
    public string? UserId => User?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User?.FindFirstValue("sub");

    public string? Email => User?.FindFirstValue(ClaimTypes.Email)
        ?? User?.FindFirstValue("email");

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public Guid? ProfileId => Guid.TryParse(User?.FindFirstValue(AuthClaimTypes.ProfileId), out var id) ? id : null;

    public bool HasPermission(string permission)
        => User?.HasClaim(AuthClaimTypes.Permissions, permission) ?? false;
}
