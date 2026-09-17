using MC.Profiles.Application.Interfaces.Services;
using MC.Profiles.Infrastructure.Options;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace MC.Profiles.Infrastructure.Services;

public sealed class Auth0ManagementIdentityService(
    IHttpClientFactory httpClientFactory,
    IOptions<Auth0ManagementOptions> options) : IIdentityService
{
    public const string HttpClientName = "Auth0Management";

    public async Task SetNameAsync(string externalUserId, string name, CancellationToken cancellationToken)
    {
        ValidateOptions(options.Value);
        var settings = options.Value;

        var domain = settings.Domain.Trim().TrimEnd('/');
        var client = httpClientFactory.CreateClient(HttpClientName);
        var token = await RequestAccessTokenAsync(client, domain, settings, cancellationToken);

        using var request = new HttpRequestMessage(
            HttpMethod.Patch,
            $"https://{domain}/api/v2/users/{Uri.EscapeDataString(externalUserId)}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(new
        {
            name = name
        });

        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Auth0 Management API rejected the name update ({(int)response.StatusCode}).");
        }
    }

    public async Task GrantSellerAsync(string externalUserId, CancellationToken cancellationToken)
    {
        ValidateOptions(options.Value);
        var settings = options.Value;

        var domain = settings.Domain.Trim().TrimEnd('/');
        var client = httpClientFactory.CreateClient(HttpClientName);
        var token = await RequestAccessTokenAsync(client, domain, settings, cancellationToken);

        using var request = new HttpRequestMessage(
            HttpMethod.Patch,
            $"https://{domain}/api/v2/users/{Uri.EscapeDataString(externalUserId)}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Content = JsonContent.Create(new
        {
            app_metadata = new { is_seller = true }
        });

        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"Auth0 Management API rejected the seller grant ({(int)response.StatusCode}).");
        }
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
