using System.Security.Claims;
using MC.Shared.API;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace MC.Shared.UnitTests.Authorization;

public sealed class PermissionPolicyTests
{
    [Fact]
    public async Task Policy_succeeds_when_principal_has_permission_claim()
    {
        var result = await AuthorizeAsync("listings:write");

        Assert.True(result.Succeeded);
    }

    [Fact]
    public async Task Policy_fails_when_principal_lacks_permission_claim()
    {
        var result = await AuthorizeAsync("categories:write");

        Assert.False(result.Succeeded);
    }

    private static async Task<AuthorizationResult> AuthorizeAsync(string grantedPermission)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddPermissionAuthorization("listings:write");
        await using var provider = services.BuildServiceProvider();
        var authorization = provider.GetRequiredService<IAuthorizationService>();
        var principal = new ClaimsPrincipal(
            new ClaimsIdentity([new Claim("permissions", grantedPermission)], "test"));

        return await authorization.AuthorizeAsync(principal, null, "listings:write");
    }
}
