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
    public async Task Get_me_with_local_test_identity_returns_200()
    {
        using var client = _fixture.CreateAuthenticatedClient();

        var cancellationToken = TestContext.Current.CancellationToken;
        var response = await client.GetAsync("/Profiles/me", cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<ProfileBody>(JsonOptions, cancellationToken);
        Assert.NotNull(profile);
    }

    [Fact]
    public async Task Get_unknown_profile_id_returns_404()
    {
        using var client = _fixture.CreateAuthenticatedClient();

        var response = await client.GetAsync($"/Profiles/{Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private sealed record ProfileBody(string DisplayName, string PhoneNumber, string Email);
}
