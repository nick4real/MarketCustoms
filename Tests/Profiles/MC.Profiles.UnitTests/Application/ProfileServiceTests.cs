using MC.Profiles.Application.Requests;
using MC.Profiles.Application.Services;
using MC.Profiles.Domain.Entities;
using MC.Profiles.Domain.Enums;
using MC.Profiles.UnitTests.Fakes;
using MC.Shared.Application.Common;

namespace MC.Profiles.UnitTests.Application;

public sealed class ProfileServiceTests
{
    private readonly FakeProfileRepository _repository = new();
    private readonly FakeCurrentUserService _currentUser = new();
    private readonly ProfileService _service;

    public ProfileServiceTests()
    {
        _service = new ProfileService(_repository, _currentUser);
    }

    [Fact]
    public async Task GetMe_fails_when_unauthenticated()
    {
        var result = await _service.GetMe(CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.Unauthorized, result.Error!.Code);
    }

    [Fact]
    public async Task GetMe_returns_owner_profile()
    {
        SignIn("user-1");
        var profile = await AddProfile("user-1", email: "ada@example.com", phone: "555-0100");

        var result = await _service.GetMe(CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(profile.Id, result.Value!.Id);
        Assert.True(result.Value.ProfileExists);
        Assert.Equal("Ada", result.Value.DisplayName);
        Assert.Equal("ada@example.com", result.Value.Email);
        Assert.Equal("555-0100", result.Value.PhoneNumber);
        Assert.False(result.Value.IsSeller);
    }

    [Fact]
    public async Task GetMe_returns_not_found_without_profile()
    {
        SignIn("user-1");

        var result = await _service.GetMe(CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.NotFound, result.Error!.Code);
        Assert.Equal(0, _repository.Count);
    }

    [Fact]
    public async Task GetProfileInfo_returns_public_profile()
    {
        var profile = await AddProfile("user-1", email: "ada@example.com", phone: "555-0100");
        profile.Bio = "Hello";
        profile.PictureUrl = "https://img/ada.png";

        var result = await _service.GetProfileInfo(CancellationToken.None, profile.Id);

        Assert.True(result.IsSuccess);
        Assert.Equal(profile.Id, result.Value!.Id);
        Assert.Equal("Ada", result.Value.DisplayName);
        Assert.Equal("Hello", result.Value.Bio);
        Assert.Equal("https://img/ada.png", result.Value.PictureUrl);
        Assert.False(result.Value.IsSeller);
        Assert.Null(result.Value.GetType().GetProperty("Email"));
        Assert.Null(result.Value.GetType().GetProperty("PhoneNumber"));
    }

    [Fact]
    public async Task GetProfileInfo_returns_not_found_for_unknown_id()
    {
        var result = await _service.GetProfileInfo(CancellationToken.None, Guid.NewGuid());

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.NotFound, result.Error!.Code);
    }

    [Fact]
    public async Task GetAndEnsureCurrentUserProfile_fails_when_unauthenticated()
    {
        var result = await _service.GetAndEnsureCurrentUserProfile(
            new CurrentUserMetadataRequest("Ada", null), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.Unauthorized, result.Error!.Code);
        Assert.Equal(0, _repository.CreateCalls);
    }

    [Fact]
    public async Task GetAndEnsureCurrentUserProfile_creates_profile_on_first_call()
    {
        SignIn("user-1", "ada@example.com");

        var result = await _service.GetAndEnsureCurrentUserProfile(
            new CurrentUserMetadataRequest("Ada", "https://img/ada.png"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Ada", result.Value!.DisplayName);
        Assert.Equal("https://img/ada.png", result.Value.PictureUrl);
        Assert.Equal(nameof(AccountType.Basic), result.Value.AccountType);
        Assert.Equal(1, _repository.CreateCalls);
        Assert.Equal(1, _repository.SaveCalls);
        var stored = await _repository.GetProfileByExternalIdAsync("user-1", CancellationToken.None);
        Assert.Equal(result.Value.Id, stored!.Id);
        Assert.Equal("ada@example.com", stored.Email);
    }

    [Fact]
    public async Task GetAndEnsureCurrentUserProfile_returns_same_profile_on_second_call()
    {
        SignIn("user-1");
        var request = new CurrentUserMetadataRequest("Ada", null);

        var first = await _service.GetAndEnsureCurrentUserProfile(request, CancellationToken.None);
        var second = await _service.GetAndEnsureCurrentUserProfile(request, CancellationToken.None);

        Assert.Equal(first.Value!.Id, second.Value!.Id);
        Assert.Equal(1, _repository.CreateCalls);
        Assert.Equal(1, _repository.Count);
    }

    [Fact]
    public async Task ClarifyAccountType_fails_when_unauthenticated()
    {
        var result = await _service.ClarifyAccountType(
            new ClarifyAccountTypeRequest(nameof(AccountType.Basic)), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.Unauthorized, result.Error!.Code);
    }

    [Fact]
    public async Task ClarifyAccountType_returns_not_found_without_profile()
    {
        SignIn("user-1");

        var result = await _service.ClarifyAccountType(
            new ClarifyAccountTypeRequest(nameof(AccountType.Basic)), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.NotFound, result.Error!.Code);
    }

    [Fact]
    public async Task ClarifyAccountType_updates_account_type()
    {
        SignIn("user-1");
        var profile = await AddProfile("user-1");

        var result = await _service.ClarifyAccountType(
            new ClarifyAccountTypeRequest("BUSINESS"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(AccountType.Business, profile.AccountType);
        Assert.True(result.Value!.IsSeller);
        Assert.Equal(1, _repository.SaveCalls);
    }

    private void SignIn(string userId, string? email = null)
    {
        _currentUser.IsAuthenticated = true;
        _currentUser.UserId = userId;
        _currentUser.Email = email;
    }

    private async Task<Profile> AddProfile(string externalId, string? email = null, string? phone = null)
    {
        var profile = new Profile
        {
            Id = Guid.NewGuid(),
            ExternalUserId = externalId,
            DisplayName = "Ada",
            Email = email,
            PhoneNumber = phone
        };
        await _repository.CreateProfileAsync(profile, CancellationToken.None);
        return profile;
    }
}
