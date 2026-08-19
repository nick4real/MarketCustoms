using MC.Shared.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace MC.Shared.Infrastructure.Services;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor?.HttpContext?.User;
    public string? UserId => User?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User?.FindFirstValue("sub");

    public string? Email => User?.FindFirstValue(ClaimTypes.Email)
        ?? User?.FindFirstValue("email");

    public string? PhoneNumber => User?.FindFirstValue("phone_number");

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;
    public bool IsSeller => User?.FindFirstValue("is_seller") == "true";
}
