using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Requests;
using MC.Catalog.Application.Services;
using MC.Catalog.UnitTests.Fakes;
using MC.Shared.Application.Common;

namespace MC.Catalog.UnitTests.Application;

public sealed class ListingServiceTests
{
    [Fact]
    public async Task GetDetailedListingByIdAsync_rejects_non_24_character_id()
    {
        var service = CreateService(new FakeCurrentUserService(), new FakeListingRepository());

        var result = await service.GetDetailedListingByIdAsync("not-a-valid-id", CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.Error);
        Assert.Equal(ErrorCode.ValidationFailed, result.Error.Code);
        Assert.Equal("Invalid listing ID format.", result.Error.Message);
    }

    [Fact]
    public async Task CreateListingAsync_sets_owner_from_profile_id_claim()
    {
        var profileId = Guid.NewGuid();
        var repository = new FakeListingRepository();
        var service = CreateService(new FakeCurrentUserService { ProfileId = profileId }, repository);

        var result = await service.CreateListingAsync(NewRequest(), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal(profileId, result.Value.OwnerId);
        var stored = Assert.Single(repository.Listings);
        Assert.Equal(profileId, stored.OwnerGuid);
    }

    [Fact]
    public async Task CreateListingAsync_fails_with_forbidden_when_token_has_no_profile_id()
    {
        var repository = new FakeListingRepository();
        var service = CreateService(new FakeCurrentUserService { ProfileId = null }, repository);

        var result = await service.CreateListingAsync(NewRequest(), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.Error);
        Assert.Equal(ErrorCode.Forbidden, result.Error.Code);
        Assert.Equal("Your account has no profile id yet. Sign out and sign in again.", result.Error.Message);
        Assert.Empty(repository.Listings);
    }

    private static ListingService CreateService(FakeCurrentUserService user, FakeListingRepository repository)
        => new(repository, new FakeCategoryRepository(), user);

    private static CreateListingRequest NewRequest() => new(
        "Title",
        "Description",
        1,
        new LocationDto("Testland", "R", "C", null, 0m, 0m),
        9.99m,
        1,
        [],
        [],
        []);
}
