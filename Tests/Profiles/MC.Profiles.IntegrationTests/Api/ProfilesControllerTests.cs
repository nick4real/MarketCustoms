using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MC.Profiles.IntegrationTests.Fixtures;

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
    public async Task Get_me_for_new_user_returns_200_unverified_not_server_error()
    {
        using var client = _fixture.CreateAuthenticatedClient($"new-user-{Guid.NewGuid():N}");

        var cancellationToken = TestContext.Current.CancellationToken;
        var response = await client.GetAsync("/Profiles/me", cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<OwnerProfileBody>(JsonOptions, cancellationToken);
        Assert.NotNull(profile);
        Assert.False(profile.ProfileExists);
        Assert.False(profile.IsVerified);
        Assert.False(profile.IsSeller);
    }

    [Fact]
    public async Task Get_unknown_profile_id_returns_404()
    {
        using var client = _fixture.CreateAuthenticatedClient();

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
    public async Task Post_me_returns_200_verified()
    {
        using var client = _fixture.CreateAuthenticatedClient($"clarify-{Guid.NewGuid():N}");
        var cancellationToken = TestContext.Current.CancellationToken;

        var response = await client.PostAsJsonAsync(
            "/Profiles/me",
            new { displayName = "Ada", email = "ada@example.com" },
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<OwnerProfileBody>(JsonOptions, cancellationToken);
        Assert.NotNull(profile);
        Assert.True(profile.ProfileExists);
        Assert.True(profile.IsVerified);
        Assert.Equal("Ada", profile.DisplayName);
        Assert.Equal("ada@example.com", profile.Email);
    }

    [Fact]
    public async Task Post_me_without_contact_returns_400()
    {
        using var client = _fixture.CreateAuthenticatedClient($"no-contact-{Guid.NewGuid():N}");

        var response = await client.PostAsJsonAsync(
            "/Profiles/me",
            new { displayName = "Ada" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_me_anonymous_returns_401()
    {
        using var client = _fixture.CreateAnonymousClient();

        var response = await client.PostAsJsonAsync(
            "/Profiles/me",
            new { displayName = "Ada", email = "ada@example.com" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Post_me_second_call_is_idempotent()
    {
        using var client = _fixture.CreateAuthenticatedClient($"idempotent-{Guid.NewGuid():N}");
        var cancellationToken = TestContext.Current.CancellationToken;

        var first = await client.PostAsJsonAsync(
            "/Profiles/me",
            new { displayName = "Ada", email = "ada@example.com" },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await client.PostAsJsonAsync(
            "/Profiles/me",
            new { displayName = "Changed", email = "changed@example.com" },
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        var profile = await second.Content.ReadFromJsonAsync<OwnerProfileBody>(JsonOptions, cancellationToken);
        Assert.NotNull(profile);
        Assert.Equal("Ada", profile.DisplayName);
        Assert.Equal("ada@example.com", profile.Email);
    }

    [Fact]
    public async Task Seller_application_anonymous_returns_401()
    {
        using var client = _fixture.CreateAnonymousClient();

        var response = await client.PostAsJsonAsync(
            "/Profiles/me/seller-applications",
            new { shopName = "Ada Shop" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Seller_application_unverified_returns_403()
    {
        using var client = _fixture.CreateAuthenticatedClient($"unverified-seller-{Guid.NewGuid():N}");

        var response = await client.PostAsJsonAsync(
            "/Profiles/me/seller-applications",
            new { shopName = "Ada Shop" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Seller_application_accepted_and_public_profile_omits_contact()
    {
        var userId = $"seller-{Guid.NewGuid():N}";
        using var client = _fixture.CreateAuthenticatedClient(userId);
        var cancellationToken = TestContext.Current.CancellationToken;

        var clarified = await client.PostAsJsonAsync(
            "/Profiles/me",
            new { displayName = "Ada", email = "ada@example.com" },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, clarified.StatusCode);
        var owner = await clarified.Content.ReadFromJsonAsync<OwnerProfileBody>(JsonOptions, cancellationToken);

        var shopName = $"Shop {Guid.NewGuid():N}"[..20];
        var applied = await client.PostAsJsonAsync(
            "/Profiles/me/seller-applications",
            new { shopName, bio = "Handmade" },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, applied.StatusCode);
        var seller = await applied.Content.ReadFromJsonAsync<OwnerSellerBody>(JsonOptions, cancellationToken);
        Assert.NotNull(seller);
        Assert.True(seller.IsSeller);
        Assert.Equal(shopName, seller.ShopName);

        var status = await client.GetAsync("/Profiles/me/seller", cancellationToken);
        Assert.Equal(HttpStatusCode.OK, status.StatusCode);

        using var anonymous = _fixture.CreateAnonymousClient();
        var publicResponse = await anonymous.GetAsync($"/Profiles/{owner!.Id}", cancellationToken);
        Assert.Equal(HttpStatusCode.OK, publicResponse.StatusCode);
        using var document = JsonDocument.Parse(await publicResponse.Content.ReadAsStringAsync(cancellationToken));
        var root = document.RootElement;
        Assert.False(root.TryGetProperty("email", out _));
        Assert.False(root.TryGetProperty("phoneNumber", out _));
        Assert.Equal(shopName, root.GetProperty("shopName").GetString());
        Assert.Equal("Handmade", root.GetProperty("bio").GetString());
        Assert.True(root.GetProperty("isSeller").GetBoolean());
    }

    [Fact]
    public async Task Seller_application_duplicate_shop_name_returns_409()
    {
        var shopName = $"Dup {Guid.NewGuid():N}"[..20];
        var cancellationToken = TestContext.Current.CancellationToken;

        using var first = _fixture.CreateAuthenticatedClient($"dup-a-{Guid.NewGuid():N}");
        var firstClarify = await first.PostAsJsonAsync(
            "/Profiles/me",
            new { displayName = "Ada", email = "ada@example.com" },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, firstClarify.StatusCode);
        var firstApply = await first.PostAsJsonAsync(
            "/Profiles/me/seller-applications",
            new { shopName },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, firstApply.StatusCode);

        using var second = _fixture.CreateAuthenticatedClient($"dup-b-{Guid.NewGuid():N}");
        var secondClarify = await second.PostAsJsonAsync(
            "/Profiles/me",
            new { displayName = "Grace", email = "grace@example.com" },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, secondClarify.StatusCode);
        var secondApply = await second.PostAsJsonAsync(
            "/Profiles/me/seller-applications",
            new { shopName = shopName.ToUpperInvariant() },
            cancellationToken);
        Assert.Equal(HttpStatusCode.Conflict, secondApply.StatusCode);
    }

    private sealed record OwnerProfileBody(
        bool ProfileExists,
        bool IsVerified,
        bool IsSeller,
        Guid Id,
        string DisplayName,
        string Email,
        string PhoneNumber,
        bool EmailAttestedByIdentity,
        bool PhoneAttestedByIdentity);

    private sealed record OwnerSellerBody(
        bool IsSeller,
        string? ShopName,
        string? Bio);
}
