using MC.Profiles.Application.Common;
using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Application.Interfaces.Services;
using MC.Profiles.Application.Requests;
using MC.Profiles.Application.Responses;
using MC.Profiles.Domain.Entities;
using MC.Profiles.Domain.Enums;
using MC.Shared.Application.Common;
using MC.Shared.Application.Interfaces.Repositories;
using MC.Shared.Application.Interfaces.Services;

namespace MC.Profiles.Application.Services;

public class ProfileService(
    IProfileRepository profileRepository,
    ICurrentUserService currentUserService,
    ISellerApplicationRepository sellerApplicationRepository,
    ISellerProfileRepository sellerProfileRepository,
    IIdentityService identityService,
    IUnitOfWork unitOfWork) : IProfileService
{
    public async Task<Result<OwnerProfileResponse>> GetMe(CancellationToken ct)
    {
        if (!currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(currentUserService.UserId))
            return Result<OwnerProfileResponse>.Failure(new Error(ErrorCode.Unauthorized, "Authorize to access this data"));

        var profile = await profileRepository.GetProfileByExternalIdAsync(currentUserService.UserId);
        if (profile == null)
            return Result<OwnerProfileResponse>.Success(OwnerProfileResponse.Missing());

        return Result<OwnerProfileResponse>.Success(await MapOwner(profile, ct));
    }

    public async Task<Result<PublicProfileResponse>> GetProfileInfo(CancellationToken ct, Guid id)
    {
        var profile = await profileRepository.GetProfileByIdAsync(id);
        if (profile == null)
            return Result<PublicProfileResponse>.Failure(new Error(ErrorCode.NotFound, "Profile not found"));

        var seller = await sellerProfileRepository.GetByProfileIdAsync(profile.Id, ct);
        var isSeller = seller is { IsActive: true };

        return Result<PublicProfileResponse>.Success(new PublicProfileResponse(
            Id: profile.Id,
            DisplayName: profile.DisplayName,
            ShopName: isSeller ? seller!.ShopName : null,
            Bio: isSeller ? seller!.Bio : null,
            IsSeller: isSeller));
    }

    public async Task<Result<OwnerProfileResponse>> CompleteClarification(CompleteClarificationRequest request, CancellationToken ct)
    {
        if (!currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(currentUserService.UserId))
            return Result<OwnerProfileResponse>.Failure(new Error(ErrorCode.Unauthorized, "Authorize to access this data"));

        var displayName = request.DisplayName?.Trim() ?? string.Empty;
        var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        var phoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber)
            ? null
            : PhoneNumberNormalizer.Normalize(request.PhoneNumber);

        if (displayName.Length == 0 || (email is null && string.IsNullOrEmpty(phoneNumber)))
        {
            return Result<OwnerProfileResponse>.Failure(new Error(
                ErrorCode.ValidationFailed,
                "Provide a display name and at least one of email or phone."));
        }

        var existing = await profileRepository.GetProfileByExternalIdAsync(currentUserService.UserId);
        if (existing is { IsVerified: true })
            return Result<OwnerProfileResponse>.Success(await MapOwner(existing, ct));

        if (existing is null)
        {
            existing = await profileRepository.AddOrGetByExternalUserIdAsync(new Profile
            {
                Id = Guid.NewGuid(),
                ExternalUserId = currentUserService.UserId,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            });

            if (existing.IsVerified)
                return Result<OwnerProfileResponse>.Success(await MapOwner(existing, ct));
        }

        existing.DisplayName = displayName;
        existing.Email = email;
        existing.PhoneNumber = string.IsNullOrEmpty(phoneNumber) ? null : phoneNumber;
        existing.EmailAttestedByIdentity = email is not null
            && string.Equals(email, currentUserService.Email, StringComparison.OrdinalIgnoreCase);
        existing.PhoneAttestedByIdentity = phoneNumber is not null
            && PhoneNumberNormalizer.MatchesIdentityClaim(phoneNumber, currentUserService.PhoneNumber);
        existing.IsVerified = true;
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        await profileRepository.SaveChangesAsync();
        return Result<OwnerProfileResponse>.Success(await MapOwner(existing, ct));
    }

    public async Task<Result> RequireVerifiedProfile(CancellationToken ct)
    {
        var profile = await GetVerifiedProfile(ct);
        if (!profile.IsSuccess)
            return Result.Failure(profile.Error!);

        return Result.Success();
    }

    public async Task<Result<OwnerSellerResponse>> GetMySellerStatus(CancellationToken ct)
    {
        var profileResult = await GetVerifiedProfile(ct);
        if (!profileResult.IsSuccess)
            return Result<OwnerSellerResponse>.Failure(profileResult.Error!);

        return Result<OwnerSellerResponse>.Success(await MapSeller(profileResult.Value!, ct));
    }

    public async Task<Result<OwnerSellerResponse>> SubmitSellerApplication(
        SubmitSellerApplicationRequest request,
        CancellationToken ct)
    {
        var profileResult = await GetVerifiedProfile(ct);
        if (!profileResult.IsSuccess)
            return Result<OwnerSellerResponse>.Failure(profileResult.Error!);

        var profile = profileResult.Value!;
        var existingSeller = await sellerProfileRepository.GetByProfileIdAsync(profile.Id, ct);
        if (existingSeller is { IsActive: true })
        {
            return Result<OwnerSellerResponse>.Failure(new Error(ErrorCode.Conflict, "You are already a seller."));
        }

        var shopName = request.ShopName.Trim();
        var bio = string.IsNullOrWhiteSpace(request.Bio) ? null : request.Bio.Trim();
        var normalized = shopName.ToUpperInvariant();
        var taken = await sellerProfileRepository.GetActiveByNormalizedShopNameAsync(normalized, ct);
        if (taken is not null)
        {
            return Result<OwnerSellerResponse>.Failure(new Error(ErrorCode.Conflict, "That shop name is already taken."));
        }

        try
        {
            await unitOfWork.ExecuteInTransactionAsync(async innerCt =>
            {
                var now = DateTimeOffset.UtcNow;
                await sellerApplicationRepository.AddAsync(new SellerApplication
                {
                    Id = Guid.NewGuid(),
                    ProfileId = profile.Id,
                    ShopName = shopName,
                    Bio = bio,
                    CreatedAt = now,
                    UpdatedAt = now,
                    Outcome = SellerApplicationOutcome.Accepted
                }, innerCt);

                if (existingSeller is null)
                {
                    await sellerProfileRepository.AddAsync(new SellerProfile
                    {
                        Id = Guid.NewGuid(),
                        ProfileId = profile.Id,
                        ShopName = shopName,
                        ShopNameNormalized = normalized,
                        Bio = bio,
                        IsActive = true,
                        CreatedAt = now,
                        UpdatedAt = now
                    }, innerCt);
                }
                else
                {
                    existingSeller.ShopName = shopName;
                    existingSeller.ShopNameNormalized = normalized;
                    existingSeller.Bio = bio;
                    existingSeller.IsActive = true;
                    existingSeller.UpdatedAt = now;
                }

                await unitOfWork.SaveChangesAsync(innerCt);
                await identityService.GrantSellerAsync(currentUserService.UserId!, innerCt);
            }, ct);
        }
        catch (ShopNameConflictException)
        {
            return Result<OwnerSellerResponse>.Failure(new Error(ErrorCode.Conflict, "That shop name is already taken."));
        }
        catch (AlreadySellerException)
        {
            return Result<OwnerSellerResponse>.Failure(new Error(ErrorCode.Conflict, "You are already a seller."));
        }
        catch (Exception)
        {
            return Result<OwnerSellerResponse>.Failure(new Error(
                ErrorCode.InternalServerError,
                "Unable to complete seller application. Please retry."));
        }

        return Result<OwnerSellerResponse>.Success(await MapSeller(profile, ct));
    }

    internal async Task<Result<Profile>> GetVerifiedProfile(CancellationToken ct)
    {
        if (!currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(currentUserService.UserId))
            return Result<Profile>.Failure(new Error(ErrorCode.Unauthorized, "Authorize to access this data"));

        var profile = await profileRepository.GetProfileByExternalIdAsync(currentUserService.UserId);
        if (profile == null || !profile.IsVerified)
            return Result<Profile>.Failure(new Error(ErrorCode.Forbidden, "Complete profile clarification before continuing."));

        return Result<Profile>.Success(profile);
    }

    private async Task<OwnerProfileResponse> MapOwner(Profile profile, CancellationToken ct)
    {
        var seller = await sellerProfileRepository.GetByProfileIdAsync(profile.Id, ct);
        return new OwnerProfileResponse(
            ProfileExists: true,
            IsVerified: profile.IsVerified,
            IsSeller: seller is { IsActive: true },
            Id: profile.Id,
            DisplayName: profile.DisplayName,
            Email: profile.Email ?? string.Empty,
            PhoneNumber: profile.PhoneNumber ?? string.Empty,
            EmailAttestedByIdentity: profile.EmailAttestedByIdentity,
            PhoneAttestedByIdentity: profile.PhoneAttestedByIdentity);
    }

    private async Task<OwnerSellerResponse> MapSeller(Profile profile, CancellationToken ct)
    {
        var seller = await sellerProfileRepository.GetByProfileIdAsync(profile.Id, ct);
        var application = await sellerApplicationRepository.GetLatestByProfileIdAsync(profile.Id, ct);
        var isSeller = seller is { IsActive: true };

        return new OwnerSellerResponse(
            IsSeller: isSeller,
            ShopName: isSeller ? seller!.ShopName : null,
            Bio: isSeller ? seller!.Bio : null,
            Application: application is null
                ? null
                : new OwnerSellerApplicationResponse(
                    ShopName: application.ShopName,
                    Bio: application.Bio,
                    CreatedAt: application.CreatedAt,
                    UpdatedAt: application.UpdatedAt,
                    Outcome: application.Outcome.ToString(),
                    RejectionReason: application.RejectionReason));
    }
}
