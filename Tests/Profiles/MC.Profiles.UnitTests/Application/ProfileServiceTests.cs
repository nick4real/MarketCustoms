using MC.Profiles.Application.Requests;
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
        var service = CreateService(out _, out _, out _, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = false;
        currentUser.UserId = null;

        var result = await service.GetMe(CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.Error);
        Assert.Equal(ErrorCode.Unauthorized, result.Error.Code);
    }

    [Fact]
    public async Task GetMe_returns_missing_status_without_creating_a_profile()
    {
        var service = CreateService(out var repository, out _, out _, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";

        var result = await service.GetMe(CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.False(result.Value.ProfileExists);
        Assert.False(result.Value.IsVerified);
        Assert.False(result.Value.IsSeller);
        Assert.Null(await repository.GetProfileByExternalIdAsync("user-1"));
    }

    [Fact]
    public async Task GetProfileInfo_omits_email_and_phone()
    {
        var service = CreateService(out var repository, out _, out _, out _, out _, out _);
        var profile = VerifiedProfile("user-1");
        profile.PhoneNumber = "555-0100";
        profile.Email = "ada@example.com";
        await repository.CreateProfileAsync(profile);

        var result = await service.GetProfileInfo(CancellationToken.None, profile.Id);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.Equal("Ada", result.Value.DisplayName);
        Assert.Equal(profile.Id, result.Value.Id);
        Assert.False(result.Value.IsSeller);
        Assert.Null(result.Value.ShopName);
        Assert.Null(result.Value.Bio);
        Assert.Null(result.Value.GetType().GetProperty("Email"));
        Assert.Null(result.Value.GetType().GetProperty("PhoneNumber"));
    }

    [Fact]
    public async Task CompleteClarification_fails_when_unauthenticated()
    {
        var service = CreateService(out _, out _, out _, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = false;
        currentUser.UserId = null;

        var result = await service.CompleteClarification(
            new CompleteClarificationRequest("Ada", "ada@example.com", null),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.Error);
        Assert.Equal(ErrorCode.Unauthorized, result.Error.Code);
    }

    [Fact]
    public async Task CompleteClarification_fails_when_neither_contact_is_provided()
    {
        var service = CreateService(out _, out _, out _, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";

        var result = await service.CompleteClarification(
            new CompleteClarificationRequest("Ada", null, null),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.NotNull(result.Error);
        Assert.Equal(ErrorCode.ValidationFailed, result.Error.Code);
    }

    [Fact]
    public async Task CompleteClarification_creates_and_verifies_a_profile()
    {
        var service = CreateService(out var repository, out _, out _, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";
        currentUser.Email = "ada@example.com";

        var result = await service.CompleteClarification(
            new CompleteClarificationRequest("Ada", "ada@example.com", null),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.Value);
        Assert.True(result.Value.ProfileExists);
        Assert.True(result.Value.IsVerified);
        Assert.Equal("Ada", result.Value.DisplayName);
        Assert.Equal("ada@example.com", result.Value.Email);
        Assert.True(result.Value.EmailAttestedByIdentity);
        Assert.NotNull(await repository.GetProfileByExternalIdAsync("user-1"));
    }

    [Fact]
    public async Task CompleteClarification_completes_an_existing_unverified_row()
    {
        var service = CreateService(out var repository, out _, out _, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";
        var profile = new Profile
        {
            Id = Guid.NewGuid(),
            ExternalUserId = "user-1",
            DisplayName = string.Empty,
            IsVerified = false
        };
        await repository.CreateProfileAsync(profile);

        var result = await service.CompleteClarification(
            new CompleteClarificationRequest("Ada", null, "+1 (555) 010-1234"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value!.IsVerified);
        Assert.Equal("Ada", profile.DisplayName);
        Assert.Equal("+15550101234", profile.PhoneNumber);
        Assert.Equal(profile.Id, (await repository.GetProfileByExternalIdAsync("user-1"))!.Id);
    }

    [Fact]
    public async Task CompleteClarification_does_not_change_verified_fields()
    {
        var service = CreateService(out var repository, out _, out _, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";
        var profile = VerifiedProfile("user-1");
        profile.Email = "original@example.com";
        profile.PhoneNumber = "15550101234";
        profile.DisplayName = "Original";
        await repository.CreateProfileAsync(profile);

        var result = await service.CompleteClarification(
            new CompleteClarificationRequest("Changed", "changed@example.com", "19998887777"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Original", result.Value!.DisplayName);
        Assert.Equal("original@example.com", result.Value.Email);
        Assert.Equal("15550101234", result.Value.PhoneNumber);
        Assert.Equal("Original", profile.DisplayName);
    }

    [Fact]
    public async Task CompleteClarification_sets_attestation_only_when_values_match_identity()
    {
        var matchService = CreateService(out _, out _, out _, out _, out _, out var matchUser);
        matchUser.IsAuthenticated = true;
        matchUser.UserId = "user-1";
        matchUser.Email = "ada@example.com";
        matchUser.PhoneNumber = "+1-555-010-1234";

        var match = await matchService.CompleteClarification(
            new CompleteClarificationRequest("Ada", "ADA@example.com", "+1 555 010 1234"),
            CancellationToken.None);

        Assert.True(match.Value!.EmailAttestedByIdentity);
        Assert.True(match.Value.PhoneAttestedByIdentity);

        var mismatchService = CreateService(out _, out _, out _, out _, out _, out var mismatchUser);
        mismatchUser.IsAuthenticated = true;
        mismatchUser.UserId = "user-2";
        mismatchUser.Email = "ada@example.com";
        mismatchUser.PhoneNumber = "+15550101234";

        var mismatch = await mismatchService.CompleteClarification(
            new CompleteClarificationRequest("Ada", "other@example.com", "19998887777"),
            CancellationToken.None);

        Assert.True(mismatch.Value!.IsVerified);
        Assert.False(mismatch.Value.EmailAttestedByIdentity);
        Assert.False(mismatch.Value.PhoneAttestedByIdentity);
    }

    [Fact]
    public async Task RequireVerifiedProfile_forbids_missing_and_unverified_profiles()
    {
        var missing = CreateService(out _, out _, out _, out _, out _, out var missingUser);
        missingUser.IsAuthenticated = true;
        missingUser.UserId = "missing-user";
        var missingResult = await missing.RequireVerifiedProfile(CancellationToken.None);
        Assert.False(missingResult.IsSuccess);
        Assert.Equal(ErrorCode.Forbidden, missingResult.Error!.Code);

        var unverified = CreateService(out var repository, out _, out _, out _, out _, out var unverifiedUser);
        unverifiedUser.IsAuthenticated = true;
        unverifiedUser.UserId = "unverified";
        await repository.CreateProfileAsync(new Profile
        {
            Id = Guid.NewGuid(),
            ExternalUserId = "unverified",
            DisplayName = "Ada",
            IsVerified = false
        });

        var unverifiedResult = await unverified.RequireVerifiedProfile(CancellationToken.None);
        Assert.False(unverifiedResult.IsSuccess);
        Assert.Equal(ErrorCode.Forbidden, unverifiedResult.Error!.Code);
    }

    [Fact]
    public async Task SubmitSellerApplication_forbids_unverified_users()
    {
        var service = CreateService(out _, out _, out _, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";

        var result = await service.SubmitSellerApplication(
            new SubmitSellerApplicationRequest("Ada's Shop", null),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.Forbidden, result.Error!.Code);
    }

    [Fact]
    public async Task SubmitSellerApplication_conflicts_when_already_a_seller()
    {
        var service = CreateService(out var repository, out _, out var sellers, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";
        var profile = VerifiedProfile("user-1");
        await repository.CreateProfileAsync(profile);
        await sellers.AddAsync(new SellerProfile
        {
            Id = Guid.NewGuid(),
            ProfileId = profile.Id,
            ShopName = "Ada's Shop",
            ShopNameNormalized = "ADA'S SHOP",
            IsActive = true
        }, CancellationToken.None);

        var result = await service.SubmitSellerApplication(
            new SubmitSellerApplicationRequest("Other Shop", null),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.Conflict, result.Error!.Code);
        Assert.Contains("already a seller", result.Error.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SubmitSellerApplication_conflicts_on_case_insensitive_shop_name()
    {
        var service = CreateService(out var repository, out _, out var sellers, out _, out _, out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";
        var profile = VerifiedProfile("user-1");
        await repository.CreateProfileAsync(profile);
        await sellers.AddAsync(new SellerProfile
        {
            Id = Guid.NewGuid(),
            ProfileId = Guid.NewGuid(),
            ShopName = "Ada's Shop",
            ShopNameNormalized = "ADA'S SHOP",
            IsActive = true
        }, CancellationToken.None);

        var result = await service.SubmitSellerApplication(
            new SubmitSellerApplicationRequest("ada's shop", null),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.Conflict, result.Error!.Code);
        Assert.Contains("shop name is already taken", result.Error.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task SubmitSellerApplication_rolls_back_when_identity_grant_fails()
    {
        var service = CreateService(
            out var repository,
            out var applications,
            out var sellers,
            out var identity,
            out _,
            out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";
        identity.ShouldFail = true;
        await repository.CreateProfileAsync(VerifiedProfile("user-1"));

        var result = await service.SubmitSellerApplication(
            new SubmitSellerApplicationRequest("Ada's Shop", "Handmade goods"),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCode.InternalServerError, result.Error!.Code);
        Assert.Empty(applications.Items);
        Assert.Empty(sellers.Items);
        Assert.Equal(1, identity.GrantCount);
    }

    [Fact]
    public async Task SubmitSellerApplication_marks_an_active_seller_on_success()
    {
        var service = CreateService(
            out var repository,
            out var applications,
            out var sellers,
            out var identity,
            out _,
            out var currentUser);
        currentUser.IsAuthenticated = true;
        currentUser.UserId = "user-1";
        await repository.CreateProfileAsync(VerifiedProfile("user-1"));

        var result = await service.SubmitSellerApplication(
            new SubmitSellerApplicationRequest("Ada's Shop", "Handmade goods"),
            CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.True(result.Value!.IsSeller);
        Assert.Equal("Ada's Shop", result.Value.ShopName);
        Assert.Equal("Handmade goods", result.Value.Bio);
        Assert.Equal("Accepted", result.Value.Application!.Outcome);
        Assert.Equal(1, identity.GrantCount);
        Assert.Single(applications.Items);
        Assert.True(sellers.Items[0].IsActive);

        var me = await service.GetMe(CancellationToken.None);
        Assert.True(me.Value!.IsSeller);
    }

    private static Profile VerifiedProfile(string externalUserId) => new()
    {
        Id = Guid.NewGuid(),
        ExternalUserId = externalUserId,
        DisplayName = "Ada",
        Email = "ada@example.com",
        IsVerified = true
    };

    private static ProfileService CreateService(
        out FakeProfileRepository profiles,
        out FakeSellerApplicationRepository applications,
        out FakeSellerProfileRepository sellers,
        out FakeSellerIdentityService identity,
        out FakeUnitOfWork unitOfWork,
        out FakeCurrentUserService currentUser)
    {
        profiles = new FakeProfileRepository();
        applications = new FakeSellerApplicationRepository();
        sellers = new FakeSellerProfileRepository();
        identity = new FakeSellerIdentityService();
        unitOfWork = new FakeUnitOfWork(applications, sellers);
        currentUser = new FakeCurrentUserService();
        return new ProfileService(profiles, currentUser, applications, sellers, identity, unitOfWork);
    }
}
