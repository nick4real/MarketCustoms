using System.Security.Claims;
using MC.Shared.Application.Common;
using MC.Shared.Infrastructure.Services;
using Microsoft.AspNetCore.Http;

namespace MC.Shared.UnitTests.Services;

public sealed class Auth0CurrentUserServiceTests
{
    private static readonly Guid Id = Guid.Parse("3f2b9c1e-0000-4000-8000-000000000001");

    [Fact]
    public void ProfileId_reads_profile_id_claim()
    {
        var service = CreateService(new Claim(AuthClaimTypes.ProfileId, Id.ToString()));

        Assert.Equal(Id, service.ProfileId);
    }

    [Fact]
    public void ProfileId_is_null_when_claim_missing_or_not_a_guid()
    {
        Assert.Null(CreateService().ProfileId);
        Assert.Null(CreateService(new Claim(AuthClaimTypes.ProfileId, "abc")).ProfileId);
    }

    [Fact]
    public void HasPermission_is_true_only_for_present_permission()
    {
        var service = CreateService(new Claim(AuthClaimTypes.Permissions, "listings:write"));

        Assert.True(service.HasPermission("listings:write"));
        Assert.False(service.HasPermission("categories:write"));
    }

    private static Auth0CurrentUserService CreateService(params Claim[] claims)
    {
        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity(claims, "test"))
        };
        return new Auth0CurrentUserService(new HttpContextAccessor { HttpContext = context });
    }
}
