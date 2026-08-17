using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MC.Catalog.IntegrationTests.Fixtures;

namespace MC.Catalog.IntegrationTests.Api;

[Collection(CatalogAppCollection.Name)]
public sealed class ProductsControllerTests
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly CatalogAppFixture _fixture;

    public ProductsControllerTests(CatalogAppFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Get_invalid_product_id_returns_400()
    {
        using var client = _fixture.CreateAnonymousClient();
        var cancellationToken = TestContext.Current.CancellationToken;

        var response = await client.GetAsync("/Products/not-a-valid-id", cancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ErrorBody>(JsonOptions, cancellationToken);
        Assert.NotNull(error);
        Assert.Equal(400, error.Code);
    }

    [Fact]
    public async Task Create_product_without_auth_returns_401()
    {
        using var client = _fixture.CreateAnonymousClient();

        var response = await client.PostAsJsonAsync("/Products/create", NewProduct(1), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Authenticated_create_persists_product_in_isolated_stores()
    {
        using var anonymous = _fixture.CreateAnonymousClient();
        using var authenticated = _fixture.CreateAuthenticatedClient();
        var cancellationToken = TestContext.Current.CancellationToken;

        var createCategory = await authenticated.PostAsJsonAsync(
            "/Categories",
            new { name = $"Integration Category {Guid.NewGuid():N}", parentId = (uint?)null },
            cancellationToken);
        Assert.Equal(HttpStatusCode.OK, createCategory.StatusCode);

        var categoriesResponse = await anonymous.GetAsync("/Categories", cancellationToken);
        Assert.Equal(HttpStatusCode.OK, categoriesResponse.StatusCode);
        var categories = await categoriesResponse.Content.ReadFromJsonAsync<CategoryBody[]>(JsonOptions, cancellationToken);
        Assert.NotNull(categories);
        Assert.NotEmpty(categories);
        var categoryId = categories[0].Id;

        var title = $"Integration Product {Guid.NewGuid():N}";
        var createProduct = await authenticated.PostAsJsonAsync("/Products/create", NewProduct(categoryId, title), cancellationToken);
        Assert.Equal(HttpStatusCode.OK, createProduct.StatusCode);

        var created = await createProduct.Content.ReadFromJsonAsync<ProductBody>(JsonOptions, cancellationToken);
        var productId = created is { Id.Length: 24 } ? created.Id : await FindProductIdByTitle(anonymous, title, cancellationToken);

        var getResponse = await anonymous.GetAsync($"/Products/{productId}", cancellationToken);
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var fetched = await getResponse.Content.ReadFromJsonAsync<ProductBody>(JsonOptions, cancellationToken);
        Assert.NotNull(fetched);
        Assert.Equal(title, fetched.Title);
        Assert.Equal(categoryId, fetched.CategoryId);
    }

    private static async Task<string> FindProductIdByTitle(HttpClient client, string title, CancellationToken cancellationToken)
    {
        var listResponse = await client.GetAsync("/Products", cancellationToken);
        listResponse.EnsureSuccessStatusCode();
        var page = await listResponse.Content.ReadFromJsonAsync<ProductPage>(JsonOptions, cancellationToken);
        Assert.NotNull(page);
        var match = Assert.Single(page.Items, item => item.Title == title);
        Assert.False(string.IsNullOrWhiteSpace(match.Id));
        return match.Id;
    }

    private static object NewProduct(uint categoryId, string title = "Unauthorized product") => new
    {
        ownerId = CatalogAppFixture.LocalTestUserId,
        title,
        description = "Created by Catalog integration tests",
        categoryId,
        price = 9.99m,
        stockQuantity = 1,
        imageLinks = Array.Empty<string>(),
        tags = Array.Empty<string>(),
        parameters = Array.Empty<object>()
    };

    private sealed record ErrorBody(int Code, string Message);
    private sealed record CategoryBody(uint Id, string Name);
    private sealed record ProductBody(string Id, string Title, uint CategoryId);
    private sealed record ProductPage(ProductItem[] Items);
    private sealed record ProductItem(string Id, string Title);
}
