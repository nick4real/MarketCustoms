using MC.Shared.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace MC.Shared.Infrastructure.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor?.HttpContext?.User;
    public string? UserId => User?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User?.FindFirstValue("sub");

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
    // TODO: Test it
    public bool IsSeller => User?.FindFirstValue("is_seller") == "true";
}
