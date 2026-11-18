using MC.Profiles.IntegrationTests.Fixtures;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace MC.Profiles.IntegrationTests.Api;

[Collection(ProfilesAppCollection.Name)]
public sealed class ProfilesControllerTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly ProfilesAppFixture _fixture;

    public ProfilesControllerTests(ProfilesAppFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Get_me_without_auth_returns_401()
    {
        using var client = _fixture.CreateAnonymousClient();

        var response = await client.GetAsync("/Profiles/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Get_me_for_user_without_profile_returns_404()
    {
        using var client = _fixture.CreateAuthenticatedClient($"no-profile-{Guid.NewGuid():N}");

        var response = await client.GetAsync("/Profiles/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Get_me_after_current_user_metadata_returns_200()
    {
        using var client = _fixture.CreateAuthenticatedClient($"get-me-{Guid.NewGuid():N}");
        var cancellationToken = TestContext.Current.CancellationToken;
        var created = await EnsureProfileAsync(client, "Ada", cancellationToken);

        var response = await client.GetAsync("/Profiles/me", cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<OwnerProfileBody>(JsonOptions, cancellationToken);
        Assert.NotNull(profile);
        Assert.True(profile.ProfileExists);
        Assert.False(profile.IsVerified);
        Assert.False(profile.IsSeller);
        Assert.Equal(created.Id, profile.Id);
        Assert.Equal("Ada", profile.DisplayName);
    }

    [Fact]
    public async Task Current_user_metadata_without_auth_returns_401()
    {
        using var client = _fixture.CreateAnonymousClient();

        var response = await client.PostAsJsonAsync(
            "/Profiles/me/current-user-metadata",
            new { displayName = "Ada" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Current_user_metadata_for_new_user_returns_200_and_creates_profile()
    {
        using var client = _fixture.CreateAuthenticatedClient($"metadata-{Guid.NewGuid():N}");
        var cancellationToken = TestContext.Current.CancellationToken;

        var response = await client.PostAsJsonAsync(
            "/Profiles/me/current-user-metadata",
            new { displayName = "Ada", pictureUrl = "https://example.com/ada.png" },
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var metadata = await response.Content.ReadFromJsonAsync<MetadataBody>(JsonOptions, cancellationToken);
        Assert.NotNull(metadata);
        Assert.NotEqual(Guid.Empty, metadata.Id);
        Assert.Equal("Ada", metadata.DisplayName);
        Assert.Equal("https://example.com/ada.png", metadata.PictureUrl);
        Assert.Equal("Basic", metadata.AccountType);
        var me = await client.GetAsync("/Profiles/me", cancellationToken);
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
    }

    [Fact]
    public async Task Current_user_metadata_second_call_returns_same_profile()
    {
        using var client = _fixture.CreateAuthenticatedClient($"idempotent-{Guid.NewGuid():N}");
        var cancellationToken = TestContext.Current.CancellationToken;
        var first = await EnsureProfileAsync(client, "Ada", cancellationToken);

        var second = await EnsureProfileAsync(client, "Changed", cancellationToken);

        Assert.Equal(first.Id, second.Id);
        Assert.Equal("Ada", second.DisplayName);
    }

    [Fact]
    public async Task Get_profile_anonymous_returns_200_without_contact_fields()
    {
        using var client = _fixture.CreateAuthenticatedClient($"public-{Guid.NewGuid():N}");
        var cancellationToken = TestContext.Current.CancellationToken;
        var created = await EnsureProfileAsync(client, "Ada", cancellationToken);

        using var anonymous = _fixture.CreateAnonymousClient();
        var response = await anonymous.GetAsync($"/Profiles/{created.Id}", cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var root = document.RootElement;
        Assert.Equal(created.Id, root.GetProperty("id").GetGuid());
        Assert.Equal("Ada", root.GetProperty("displayName").GetString());
        Assert.False(root.GetProperty("isSeller").GetBoolean());
        Assert.False(root.TryGetProperty("email", out _));
        Assert.False(root.TryGetProperty("phoneNumber", out _));
    }

    [Fact]
    public async Task Get_unknown_profile_id_returns_404()
    {
        using var client = _fixture.CreateAuthenticatedClient($"unknown-{Guid.NewGuid():N}");

        var response = await client.GetAsync($"/Profiles/{Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Get_unknown_profile_id_anonymous_returns_404_not_401()
    {
        using var client = _fixture.CreateAnonymousClient();

        var response = await client.GetAsync($"/Profiles/{Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Clarify_account_type_without_auth_returns_401()
    {
        using var client = _fixture.CreateAnonymousClient();

        var response = await client.PostAsJsonAsync(
            "/Profiles/me/clarify-account-type",
            new { accountType = "Individual" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Clarify_account_type_with_valid_request_returns_200()
    {
        using var client = _fixture.CreateAuthenticatedClient($"clarify-{Guid.NewGuid():N}");
        var cancellationToken = TestContext.Current.CancellationToken;
        var created = await EnsureProfileAsync(client, "Ada", cancellationToken);

        var response = await client.PostAsJsonAsync(
            "/Profiles/me/clarify-account-type",
            new { accountType = "Individual" },
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<OwnerProfileBody>(JsonOptions, cancellationToken);
        Assert.NotNull(profile);
        Assert.Equal(created.Id, profile.Id);
        Assert.True(profile.IsSeller);
    }

    [Fact]
    public async Task Clarify_account_type_with_unknown_type_returns_400()
    {
        using var client = _fixture.CreateAuthenticatedClient($"clarify-bad-{Guid.NewGuid():N}");
        var cancellationToken = TestContext.Current.CancellationToken;
        await EnsureProfileAsync(client, "Ada", cancellationToken);

        var response = await client.PostAsJsonAsync(
            "/Profiles/me/clarify-account-type",
            new { accountType = "Seller" },
            cancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Clarify_account_type_to_basic_returns_200_and_is_not_seller()
    {
        using var client = _fixture.CreateAuthenticatedClient($"clarify-basic-{Guid.NewGuid():N}");
        var cancellationToken = TestContext.Current.CancellationToken;
        await EnsureProfileAsync(client, "Ada", cancellationToken);
        var seller = await client.PostAsJsonAsync(
            "/Profiles/me/clarify-account-type",
            new { accountType = "Individual" },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, seller.StatusCode);

        var response = await client.PostAsJsonAsync(
            "/Profiles/me/clarify-account-type",
            new { accountType = "Basic" },
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<OwnerProfileBody>(JsonOptions, cancellationToken);
        Assert.NotNull(profile);
        Assert.False(profile.IsSeller);
    }

    private static async Task<MetadataBody> EnsureProfileAsync(
        HttpClient client,
        string displayName,
        CancellationToken cancellationToken)
    {
        var response = await client.PostAsJsonAsync(
            "/Profiles/me/current-user-metadata",
            new { displayName },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var metadata = await response.Content.ReadFromJsonAsync<MetadataBody>(JsonOptions, cancellationToken);
        Assert.NotNull(metadata);
        return metadata;
    }

    private sealed record OwnerProfileBody(
        bool ProfileExists,
        bool IsVerified,
        bool IsSeller,
        Guid Id,
        string DisplayName,
        string Email,
        string PhoneNumber);

    private sealed record MetadataBody(
        Guid Id,
        string DisplayName,
        string? PictureUrl,
        string AccountType);
}
