using System.Security.Claims;
using System.Text.Encodings.Web;
using MC.Shared.API.Authentication;
using MC.Shared.Application.Common;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;

namespace MC.Shared.UnitTests.Authentication;

public sealed class LocalTestAuthenticationHandlerTests
{
    private const string ProfileId = "3f2b9c1e-0000-4000-8000-000000000001";

    [Fact]
    public async Task Permissions_option_adds_one_claim_per_permission()
    {
        var principal = await AuthenticateAsync("LocalTest u1;permissions=listings:write,categories:write");

        Assert.Equal(
            ["listings:write", "categories:write"],
            principal.FindAll("permissions").Select(c => c.Value));
    }

    [Fact]
    public async Task Permissions_option_is_split_and_trimmed()
    {
        var principal = await AuthenticateAsync("LocalTest u1;permissions= listings:write , ,categories:write");

        Assert.Equal(
            ["listings:write", "categories:write"],
            principal.FindAll("permissions").Select(c => c.Value));
    }

    [Fact]
    public async Task Profile_id_option_adds_profile_id_claim()
    {
        var principal = await AuthenticateAsync($"LocalTest u1;profile_id={ProfileId}");

        Assert.Equal(ProfileId, principal.FindFirstValue(AuthClaimTypes.ProfileId));
    }

    [Fact]
    public async Task Profile_id_option_is_ignored_when_not_a_guid()
    {
        var principal = await AuthenticateAsync("LocalTest u1;profile_id=abc");

        Assert.Null(principal.FindFirst(AuthClaimTypes.ProfileId));
    }

    [Fact]
    public async Task Is_seller_option_is_no_longer_recognised()
    {
        var principal = await AuthenticateAsync("LocalTest u1;is_seller=true");

        Assert.Null(principal.FindFirst("is_seller"));
    }

    private static async Task<ClaimsPrincipal> AuthenticateAsync(string header)
    {
        var context = new DefaultHttpContext();
        context.Request.Headers.Authorization = header;
        var handler = new LocalTestAuthenticationHandler(
            new StaticOptionsMonitor(), NullLoggerFactory.Instance, UrlEncoder.Default);
        await handler.InitializeAsync(
            new AuthenticationScheme(
                LocalTestAuthenticationHandler.SchemeName, null, typeof(LocalTestAuthenticationHandler)),
            context);

        var result = await handler.AuthenticateAsync();

        Assert.True(result.Succeeded);
        return result.Principal!;
    }

    private sealed class StaticOptionsMonitor : IOptionsMonitor<AuthenticationSchemeOptions>
    {
        public AuthenticationSchemeOptions CurrentValue { get; } = new();
        public AuthenticationSchemeOptions Get(string? name) => CurrentValue;
        public IDisposable? OnChange(Action<AuthenticationSchemeOptions, string?> listener) => null;
    }
}
