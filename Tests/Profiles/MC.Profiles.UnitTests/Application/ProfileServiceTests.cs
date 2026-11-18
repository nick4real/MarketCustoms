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
    private readonly FakeIdentityService _identity = new();
    private readonly ProfileService _service;

    public ProfileServiceTests()
    {
        _service = new ProfileService(_repository, _currentUser, _identity);
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

    [Fact]
    public async Task GetAndEnsureCurrentUserProfile_writes_profile_id_before_saving_new_profile()
    {
        SignIn("user-1");

        var result = await _service.GetAndEnsureCurrentUserProfile(
            new CurrentUserMetadataRequest("Ada", null), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal([$"profile-id:user-1:{result.Value!.Id}"], _identity.Calls);
        Assert.Equal(1, _repository.SaveCalls);
    }

    [Fact]
    public async Task GetAndEnsureCurrentUserProfile_does_not_save_when_identity_provider_fails()
    {
        SignIn("user-1");
        _identity.FailWith = Result.Failure(new Error(ErrorCode.InternalServerError, "boom"));

        var result = await _service.GetAndEnsureCurrentUserProfile(
            new CurrentUserMetadataRequest("Ada", null), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.InternalServerError, result.Error!.Code);
        Assert.Equal(0, _repository.Count);
        Assert.Equal(0, _repository.SaveCalls);
    }

    [Fact]
    public async Task GetAndEnsureCurrentUserProfile_writes_profile_id_for_existing_profile_when_token_lacks_it()
    {
        SignIn("user-1");
        _currentUser.ProfileId = null;
        var profile = await AddProfile("user-1");

        var result = await _service.GetAndEnsureCurrentUserProfile(
            new CurrentUserMetadataRequest("Ada", null), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal([$"profile-id:user-1:{profile.Id}"], _identity.Calls);
    }

    [Fact]
    public async Task GetAndEnsureCurrentUserProfile_skips_identity_provider_when_token_has_profile_id()
    {
        SignIn("user-1");
        var profile = await AddProfile("user-1");
        _currentUser.ProfileId = profile.Id;

        var result = await _service.GetAndEnsureCurrentUserProfile(
            new CurrentUserMetadataRequest("Ada", null), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(_identity.Calls);
    }

    [Theory]
    [InlineData("Individual")]
    [InlineData("BUSINESS")]
    public async Task ClarifyAccountType_grants_seller_for_individual_and_business(string accountType)
    {
        SignIn("user-1");
        var profile = await AddProfile("user-1");

        var result = await _service.ClarifyAccountType(
            new ClarifyAccountTypeRequest(accountType), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(["grant:user-1"], _identity.Calls);
        Assert.Equal(Enum.Parse<AccountType>(accountType, true), profile.AccountType);
        Assert.Equal(1, _repository.SaveCalls);
    }

    [Fact]
    public async Task ClarifyAccountType_grants_seller_again_when_type_unchanged()
    {
        SignIn("user-1");
        var profile = await AddProfile("user-1");
        profile.AccountType = AccountType.Business;

        var result = await _service.ClarifyAccountType(
            new ClarifyAccountTypeRequest("Business"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(["grant:user-1"], _identity.Calls);
    }

    [Fact]
    public async Task ClarifyAccountType_revokes_seller_when_switching_to_basic()
    {
        SignIn("user-1");
        var profile = await AddProfile("user-1");
        profile.AccountType = AccountType.Individual;

        var result = await _service.ClarifyAccountType(
            new ClarifyAccountTypeRequest("Basic"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(["revoke:user-1"], _identity.Calls);
        Assert.Equal(AccountType.Basic, profile.AccountType);
        Assert.False(result.Value!.IsSeller);
    }

    [Fact]
    public async Task ClarifyAccountType_makes_no_identity_call_for_basic_to_basic()
    {
        SignIn("user-1");
        await AddProfile("user-1");

        var result = await _service.ClarifyAccountType(
            new ClarifyAccountTypeRequest("Basic"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(_identity.Calls);
    }

    [Fact]
    public async Task ClarifyAccountType_keeps_account_type_when_identity_provider_fails()
    {
        SignIn("user-1");
        var profile = await AddProfile("user-1");
        _identity.FailWith = Result.Failure(new Error(ErrorCode.InternalServerError, "boom"));

        var result = await _service.ClarifyAccountType(
            new ClarifyAccountTypeRequest("Individual"), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.InternalServerError, result.Error!.Code);
        Assert.Equal(AccountType.Basic, profile.AccountType);
        Assert.Equal(0, _repository.SaveCalls);
    }

    [Theory]
    [InlineData("Seller")]
    [InlineData("1")]
    public async Task ClarifyAccountType_rejects_unknown_type(string accountType)
    {
        SignIn("user-1");
        await AddProfile("user-1");

        var result = await _service.ClarifyAccountType(
            new ClarifyAccountTypeRequest(accountType), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.ValidationFailed, result.Error!.Code);
        Assert.Equal("Unknown account type.", result.Error.Message);
        Assert.Empty(_identity.Calls);
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
