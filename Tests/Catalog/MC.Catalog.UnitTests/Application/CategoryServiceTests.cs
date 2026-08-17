using MC.Catalog.Application.Requests;
using MC.Catalog.Application.Services;
using MC.Catalog.UnitTests.Fakes;
using MC.Shared.Application.Common;

namespace MC.Catalog.UnitTests.Application;

public sealed class CategoryServiceTests
{
    [Fact]
    public async Task AddNewCategoryAsync_rejects_empty_name()
    {
        var service = new CategoryService(new FakeCategoryRepository());

        var result = await service.AddNewCategoryAsync(
            CancellationToken.None,
            new CreateCategoryRequest(string.Empty, null));

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.Error);
        Assert.Equal(ErrorCode.ValidationFailed, result.Error.Code);
        Assert.Equal("Category name cannot be empty.", result.Error.Message);
    }
}
