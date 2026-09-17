using MC.Catalog.Application.Services;
using MC.Catalog.UnitTests.Fakes;
using MC.Shared.Application.Common;

namespace MC.Catalog.UnitTests.Application;

public sealed class ListingServiceTests
{
    [Fact]
    public async Task GetDetailedListingByIdAsync_rejects_non_24_character_id()
    {
        var service = new ListingService(new FakeListingRepository());

        var result = await service.GetDetailedListingByIdAsync("not-a-valid-id", CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.Error);
        Assert.Equal(ErrorCode.ValidationFailed, result.Error.Code);
        Assert.Equal("Invalid listing ID format.", result.Error.Message);
    }
}
