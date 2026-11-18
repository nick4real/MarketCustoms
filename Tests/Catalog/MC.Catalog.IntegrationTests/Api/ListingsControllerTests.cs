using MC.Catalog.Application.Common;
using MC.Catalog.IntegrationTests.Fixtures;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace MC.Catalog.IntegrationTests.Api;

[Collection(CatalogAppCollection.Name)]
public sealed class ListingsControllerTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly CatalogAppFixture _fixture;

    public ListingsControllerTests(CatalogAppFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Get_invalid_listing_id_returns_400()
    {
        using var client = _fixture.CreateAnonymousClient();
        var cancellationToken = TestContext.Current.CancellationToken;

        var response = await client.GetAsync("/Listings/not-a-valid-id", cancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>(JsonOptions, cancellationToken);
        Assert.NotNull(error);
        Assert.Equal(400, error.Code);
    }

    [Fact]
    public async Task Create_listing_without_auth_returns_401()
    {
        using var client = _fixture.CreateAnonymousClient();

        var response = await client.PostAsJsonAsync("/Listings/create", NewListing(1), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Create_listing_without_listings_write_returns_403()
    {
        using var client = _fixture.CreateAuthenticatedClient(profileId: Guid.NewGuid());

        var response = await client.PostAsJsonAsync("/Listings/create", NewListing(1), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Create_listing_without_profile_id_returns_403()
    {
        using var client = _fixture.CreateAuthenticatedClient(permissions: Permissions.ListingsWrite);

        var response = await client.PostAsJsonAsync("/Listings/create", NewListing(1), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Create_listing_sets_owner_from_token()
    {
        var profileId = Guid.NewGuid();
        using var anonymous = _fixture.CreateAnonymousClient();
        using var admin = _fixture.CreateAuthenticatedClient(permissions: Permissions.CategoriesWrite);
        using var client = _fixture.CreateAuthenticatedClient(profileId: profileId, permissions: Permissions.ListingsWrite);
        var cancellationToken = TestContext.Current.CancellationToken;
        var categoryId = await CreateCategoryAsync(admin, anonymous, cancellationToken);

        var title = $"Owned Listing {Guid.NewGuid():N}";
        var create = await client.PostAsJsonAsync("/Listings/create", NewListing(categoryId, title), cancellationToken);

        Assert.Equal(HttpStatusCode.OK, create.StatusCode);
        var created = await create.Content.ReadFromJsonAsync<ListingBody>(JsonOptions, cancellationToken);
        var listingId = created is { Id.Length: 24 } ? created.Id : await FindListingIdByTitle(anonymous, title, cancellationToken);
        var get = await anonymous.GetAsync($"/Listings/{listingId}", cancellationToken);
        Assert.Equal(HttpStatusCode.OK, get.StatusCode);
        var fetched = await get.Content.ReadFromJsonAsync<ListingBody>(JsonOptions, cancellationToken);
        Assert.NotNull(fetched);
        Assert.Equal(profileId, fetched.OwnerId);
    }

    [Fact]
    public async Task Authenticated_create_persists_listing_in_isolated_stores()
    {
        using var anonymous = _fixture.CreateAnonymousClient();
        using var admin = _fixture.CreateAuthenticatedClient(permissions: Permissions.CategoriesWrite);
        using var authenticated = _fixture.CreateAuthenticatedClient(profileId: Guid.NewGuid(), permissions: Permissions.ListingsWrite);
        var cancellationToken = TestContext.Current.CancellationToken;
        var categoryId = await CreateCategoryAsync(admin, anonymous, cancellationToken);

        var title = $"Integration Listing {Guid.NewGuid():N}";
        var createListing = await authenticated.PostAsJsonAsync("/Listings/create", NewListing(categoryId, title), cancellationToken);
        Assert.Equal(HttpStatusCode.OK, createListing.StatusCode);

        var created = await createListing.Content.ReadFromJsonAsync<ListingBody>(JsonOptions, cancellationToken);
        var listingId = created is { Id.Length: 24 } ? created.Id : await FindListingIdByTitle(anonymous, title, cancellationToken);

        var getResponse = await anonymous.GetAsync($"/Listings/{listingId}", cancellationToken);
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.Content.ReadFromJsonAsync<ListingBody>(JsonOptions, cancellationToken);
        Assert.NotNull(fetched);
        Assert.Equal(title, fetched.Title);
        Assert.Equal(categoryId, fetched.CategoryId);
    }

    [Fact]
    public async Task Search_by_owner_returns_only_that_owners_listings()
    {
        var ownerA = Guid.NewGuid();
        var ownerB = Guid.NewGuid();
        using var anonymous = _fixture.CreateAnonymousClient();
        using var admin = _fixture.CreateAuthenticatedClient(permissions: Permissions.CategoriesWrite);
        using var clientA = _fixture.CreateAuthenticatedClient(profileId: ownerA, permissions: Permissions.ListingsWrite);
        using var clientB = _fixture.CreateAuthenticatedClient(profileId: ownerB, permissions: Permissions.ListingsWrite);
        var cancellationToken = TestContext.Current.CancellationToken;
        var categoryId = await CreateCategoryAsync(admin, anonymous, cancellationToken);

        var titleA = $"Owner A Listing {Guid.NewGuid():N}";
        var titleB = $"Owner B Listing {Guid.NewGuid():N}";
        var createA = await clientA.PostAsJsonAsync("/Listings/create", NewListing(categoryId, titleA), cancellationToken);
        var createB = await clientB.PostAsJsonAsync("/Listings/create", NewListing(categoryId, titleB), cancellationToken);
        Assert.Equal(HttpStatusCode.OK, createA.StatusCode);
        Assert.Equal(HttpStatusCode.OK, createB.StatusCode);

        var byOwnerA = await anonymous.PostAsJsonAsync("/Listings?pageSize=40", new { ownerId = ownerA }, cancellationToken);
        Assert.Equal(HttpStatusCode.OK, byOwnerA.StatusCode);
        var pageA = await byOwnerA.Content.ReadFromJsonAsync<ListingPage>(JsonOptions, cancellationToken);
        Assert.NotNull(pageA);
        var item = Assert.Single(pageA.Items);
        Assert.Equal(titleA, item.Title);

        var byUnknown = await anonymous.PostAsJsonAsync("/Listings", new { ownerId = Guid.NewGuid() }, cancellationToken);
        Assert.Equal(HttpStatusCode.OK, byUnknown.StatusCode);
        var pageUnknown = await byUnknown.Content.ReadFromJsonAsync<ListingPage>(JsonOptions, cancellationToken);
        Assert.NotNull(pageUnknown);
        Assert.Empty(pageUnknown.Items);

        var byEmpty = await anonymous.PostAsJsonAsync("/Listings", new { ownerId = Guid.Empty }, cancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, byEmpty.StatusCode);
    }

    private static async Task<uint> CreateCategoryAsync(HttpClient admin, HttpClient anonymous, CancellationToken cancellationToken)
    {
        var createCategory = await admin.PostAsJsonAsync(
            "/Categories",
            new { name = $"Integration Category {Guid.NewGuid():N}", parentId = (uint?)null },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, createCategory.StatusCode);

        var categoriesResponse = await anonymous.GetAsync("/Categories", cancellationToken);
        Assert.Equal(HttpStatusCode.OK, categoriesResponse.StatusCode);
        var categories = await categoriesResponse.Content.ReadFromJsonAsync<CategoryBody[]>(JsonOptions, cancellationToken);
        Assert.NotNull(categories);
        Assert.NotEmpty(categories);
        return categories[0].Id;
    }

    private static async Task<string> FindListingIdByTitle(HttpClient client, string title, CancellationToken cancellationToken)
    {
        var listResponse = await client.GetAsync("/Listings", cancellationToken);
        listResponse.EnsureSuccessStatusCode();
        var page = await listResponse.Content.ReadFromJsonAsync<ListingPage>(JsonOptions, cancellationToken);
        Assert.NotNull(page);
        var match = Assert.Single(page.Items, item => item.Title == title);
        Assert.False(string.IsNullOrWhiteSpace(match.Id));
        return match.Id;
    }

    private static object NewListing(uint categoryId, string title = "Unauthorized listing") => new
    {
        title,
        description = "Created by Catalog integration tests",
        categoryId,
        location = new { country = "Testland", region = "R", city = "C", district = (string?)null, latitude = 0m, longitude = 0m },
        price = 9.99m,
        stockQuantity = 1,
        imageLinks = Array.Empty<string>(),
        tags = Array.Empty<string>(),
        parameters = Array.Empty<object>()
    };

    private sealed record ErrorBody(int Code, string Message);
    private sealed record CategoryBody(uint Id, string Name);
    private sealed record ListingBody(string Id, string Title, uint CategoryId, Guid OwnerId);
    private sealed record ListingPage(ListingItem[] Items);
    private sealed record ListingItem(string Id, string Title);
}
