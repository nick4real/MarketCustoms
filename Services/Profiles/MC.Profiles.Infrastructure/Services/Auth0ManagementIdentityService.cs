using MC.Profiles.Application.Interfaces.Services;
using MC.Profiles.Infrastructure.Options;
using MC.Shared.Application.Common;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace MC.Profiles.Infrastructure.Services;

public sealed class Auth0ManagementIdentityService(
    IHttpClientFactory httpClientFactory,
    IOptions<Auth0ManagementOptions> options,
    ILogger<Auth0ManagementIdentityService> logger) : IIdentityService
{
    public const string HttpClientName = "Auth0Management";

    public async Task<Result> SetProfileIdAsync(string externalUserId, Guid profileId, CancellationToken ct) =>
        await SendManagementRequestAsync(
            HttpMethod.Patch,
            UserPath(externalUserId),
            new { app_metadata = new { profile_id = profileId.ToString() } },
            ct);

    public async Task<Result> GrantSellerAsync(string externalUserId, CancellationToken ct)
    {
        ValidateSellerRole(options.Value);
        return await SendManagementRequestAsync(
            HttpMethod.Post, $"{UserPath(externalUserId)}/roles", SellerRoleBody(), ct);
    }

    public async Task<Result> RevokeSellerAsync(string externalUserId, CancellationToken ct)
    {
        ValidateSellerRole(options.Value);
        return await SendManagementRequestAsync(
            HttpMethod.Delete, $"{UserPath(externalUserId)}/roles", SellerRoleBody(), ct);
    }

    public async Task SetNameAsync(string externalUserId, string name, CancellationToken ct)
    {
        var result = await SendManagementRequestAsync(HttpMethod.Patch, UserPath(externalUserId), new { name }, ct);
        if (!result.IsSuccess)
            throw new InvalidOperationException("Auth0 Management API rejected the name update.");
    }

    private object SellerRoleBody() => new { roles = new[] { options.Value.SellerRoleId } };

    private static string UserPath(string externalUserId) =>
        $"/api/v2/users/{Uri.EscapeDataString(externalUserId)}";

    private async Task<Result> SendManagementRequestAsync(
        HttpMethod method,
        string path,
        object body,
        CancellationToken ct)
    {
        ValidateOptions(options.Value);
        var settings = options.Value;

        var domain = settings.Domain.Trim().TrimEnd('/');
        var client = httpClientFactory.CreateClient(HttpClientName);
        var token = await RequestAccessTokenAsync(client, domain, settings, ct);

        using var request = new HttpRequestMessage(method, $"https://{domain}{path}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(body);

        using var response = await client.SendAsync(request, ct);
        if (response.IsSuccessStatusCode)
            return Result.Success();

        var responseBody = await response.Content.ReadAsStringAsync(ct);
        logger.LogWarning(
            "Auth0 Management API {Method} {Path} failed with {StatusCode}: {ResponseBody}",
            method.Method,
            path,
            (int)response.StatusCode,
            responseBody);
        return Result.Failure(new Error(
            ErrorCode.InternalServerError,
            "The identity provider rejected the account update. Try again."));
    }

    private static void ValidateSellerRole(Auth0ManagementOptions op)
    {
        if (string.IsNullOrWhiteSpace(op.SellerRoleId))
            throw new InvalidOperationException("Auth0 seller role id is not configured.");
    }

    private static async Task<string> RequestAccessTokenAsync(
        HttpClient client,
        string domain,
        Auth0ManagementOptions settings,
        CancellationToken cancellationToken)
    {
        using var response = await client.PostAsJsonAsync(
            $"https://{domain}/oauth/token",
            new
            {
                client_id = settings.ClientId,
                client_secret = settings.ClientSecret,
                audience = $"https://{domain}/api/v2/",
                grant_type = "client_credentials"
            },
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException("Unable to obtain an Auth0 Management API token.");
        }

        var payload = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken);
        if (string.IsNullOrWhiteSpace(payload?.AccessToken))
        {
            throw new InvalidOperationException("Auth0 Management API token response was empty.");
        }

        return payload.AccessToken;
    }

    private static void ValidateOptions(Auth0ManagementOptions op)
    {
        if (string.IsNullOrWhiteSpace(op.Domain)
            || string.IsNullOrWhiteSpace(op.ClientId)
            || string.IsNullOrWhiteSpace(op.ClientSecret))
        {
            throw new InvalidOperationException("Auth0 Management API credentials are not configured.");
        }
    }

    private sealed record TokenResponse([property: JsonPropertyName("access_token")] string AccessToken);
}
