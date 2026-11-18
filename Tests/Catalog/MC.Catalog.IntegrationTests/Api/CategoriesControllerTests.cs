using MC.Catalog.Application.Common;
using MC.Catalog.IntegrationTests.Fixtures;
using System.Net;
using System.Net.Http.Json;

namespace MC.Catalog.IntegrationTests.Api;

[Collection(CatalogAppCollection.Name)]
public sealed class CategoriesControllerTests
{
    private readonly CatalogAppFixture _fixture;

    public CategoriesControllerTests(CatalogAppFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Create_category_without_categories_write_returns_403()
    {
        using var client = _fixture.CreateAuthenticatedClient(permissions: Permissions.ListingsWrite);

        var response = await client.PostAsJsonAsync("/Categories", NewCategory(), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Create_category_with_categories_write_returns_200()
    {
        using var client = _fixture.CreateAuthenticatedClient(permissions: Permissions.CategoriesWrite);

        var response = await client.PostAsJsonAsync("/Categories", NewCategory(), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private static object NewCategory() => new { name = $"Integration Category {Guid.NewGuid():N}", parentId = (uint?)null };
}
