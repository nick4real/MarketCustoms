using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace MC.Shared.API.Authentication;

public sealed class LocalTestAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "LocalTest";
    public const string DefaultUserId = "local-test-user";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(header)
            || !header.StartsWith(SchemeName, StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var remainder = header[SchemeName.Length..].Trim();
        var claims = new List<Claim>();

        if (string.IsNullOrWhiteSpace(remainder))
        {
            AddIdentityClaims(claims, DefaultUserId);
        }
        else
        {
            var segments = remainder.Split(';', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
            var userId = segments[0];
            AddIdentityClaims(claims, string.IsNullOrWhiteSpace(userId) ? DefaultUserId : userId);

            foreach (var segment in segments.Skip(1))
            {
                var separator = segment.IndexOf('=');
                if (separator <= 0)
                    continue;

                var key = segment[..separator].Trim();
                var value = segment[(separator + 1)..].Trim();
                if (string.IsNullOrEmpty(key) || string.IsNullOrEmpty(value))
                    continue;

                if (key.Equals("email", StringComparison.OrdinalIgnoreCase))
                {
                    claims.Add(new Claim(ClaimTypes.Email, value));
                    claims.Add(new Claim("email", value));
                }
                else if (key.Equals("phone_number", StringComparison.OrdinalIgnoreCase))
                {
                    claims.Add(new Claim("phone_number", value));
                }
                else if (key.Equals("is_seller", StringComparison.OrdinalIgnoreCase) && value.Equals("true", StringComparison.OrdinalIgnoreCase))
                {
                    claims.Add(new Claim("is_seller", "true"));
                }
            }
        }

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    private static void AddIdentityClaims(List<Claim> claims, string userId)
    {
        claims.Add(new Claim(ClaimTypes.NameIdentifier, userId));
        claims.Add(new Claim("sub", userId));
    }
}
