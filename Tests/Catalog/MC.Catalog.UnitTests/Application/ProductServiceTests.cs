using MC.Catalog.Application.Services;
using MC.Catalog.UnitTests.Fakes;
using MC.Shared.Application.Common;

namespace MC.Catalog.UnitTests.Application;

public sealed class ProductServiceTests
{
    [Fact]
    public async Task GetDetailedProductByIdAsync_rejects_non_24_character_id()
    {
        var service = new ProductService(new FakeProductRepository());

        var result = await service.GetDetailedProductByIdAsync("not-a-valid-id", CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.Error);
        Assert.Equal(ErrorCode.ValidationFailed, result.Error.Code);
        Assert.Equal("Invalid product ID format.", result.Error.Message);
    }
}
