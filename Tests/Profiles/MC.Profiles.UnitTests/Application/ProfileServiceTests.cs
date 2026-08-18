using MC.Profiles.Application.Services;
using MC.Profiles.Domain.Entities;
using MC.Profiles.UnitTests.Fakes;
using MC.Shared.Application.Common;

namespace MC.Profiles.UnitTests.Application;

public sealed class ProfileServiceTests
{
    [Fact]
    public async Task GetMe_fails_when_unauthenticated()
    {
        var service = new ProfileService(
            new FakeProfileRepository(),
            new FakeCurrentUserService { IsAuthenticated = false, UserId = null });

        var result = await service.GetMe(CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.Error);
        Assert.Equal(ErrorCode.Unauthorized, result.Error.Code);
    }

    [Fact]
    public async Task GetProfileInfo_returns_hidden_for_non_public_phone_and_email()
    {
        var repository = new FakeProfileRepository();
        var profile = new Profile
        {
            Id = Guid.NewGuid(),
            ExternalUserId = "user-1",
            DisplayName = "Ada",
            PhoneNumber = "555-0100",
            Email = "ada@example.com",
            IsPhonePublic = false,
            IsEmailPublic = false
        };
        await repository.CreateProfileAsync(profile);

        var service = new ProfileService(repository, new FakeCurrentUserService());
        var result = await service.GetProfileInfo(CancellationToken.None, profile.Id);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("Ada", result.Value.DisplayName);
        Assert.Equal("Hidden", result.Value.PhoneNumber);
        Assert.Equal("Hidden", result.Value.Email);
    }
}
