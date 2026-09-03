using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Application.Interfaces.Services;
using MC.Profiles.Application.Requests;
using MC.Profiles.Application.Responses;
using MC.Profiles.Domain.Entities;
using MC.Profiles.Domain.Enums;
using MC.Shared.Application.Common;
using MC.Shared.Application.Interfaces.Services;

namespace MC.Profiles.Application.Services;

public class ProfileService(
    IProfileRepository profileRepository,
    ICurrentUserService currentUserService) : IProfileService
{
    public async Task<Result<OwnerProfileResponse>> GetMe(CancellationToken ct)
    {
        if (TryReturnUnauthorized<OwnerProfileResponse>(out var unauthorizedAuthResult))
            return unauthorizedAuthResult;

        var profile = await profileRepository.GetProfileByExternalIdAsync(currentUserService.UserId, ct);
        if (profile == null)
            return Result<OwnerProfileResponse>.Failure(new Error(ErrorCode.NotFound, "Profile not found"));

        return Result<OwnerProfileResponse>.Success(MapToOwner(profile));
    }

    public async Task<Result<PublicProfileResponse>> GetProfileInfo(CancellationToken ct, Guid id)
    {
        var profile = await profileRepository.GetProfileByIdAsync(id, ct);
        if (profile == null)
            return Result<PublicProfileResponse>.Failure(new Error(ErrorCode.NotFound, "Profile not found"));

        return Result<PublicProfileResponse>.Success(new PublicProfileResponse(
            Id: profile.Id,
            DisplayName: profile.DisplayName,
            Bio: profile.Bio,
            IsSeller: profile.AccountType != AccountType.Basic));
    }

    public async Task<Result<CurrentUserMetadataResponse>> GetAndEnsureCurrentUserProfile
        (CurrentUserMetadataRequest request, CancellationToken ct)
    {
        if (!currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(currentUserService.UserId))
            return Result<CurrentUserMetadataResponse>.Failure(new Error(ErrorCode.Unauthorized, "Authorize to access this data"));

        var profile = await profileRepository.GetProfileByExternalIdAsync(currentUserService.UserId, ct);
        if (profile == null)
        {
            profile = new Profile
            {
                Id = Guid.NewGuid(),
                ExternalUserId = currentUserService.UserId,
                DisplayName = request.DisplayName ?? "Random Username 123", // TODO: Generate a random username if not provided
                PictureUrl = request.PictureUrl,
                PhoneNumber = null,
                Email = currentUserService.Email ?? null,
                Bio = null,
                AccountType = AccountType.Basic,
                IsPhonePublic = false,
                IsEmailPublic = false,
                IsVerified = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            await profileRepository.CreateProfileAsync(profile, ct);
            await profileRepository.SaveChangesAsync(ct);
        }

        return Result<CurrentUserMetadataResponse>.Success(MapToMetadata(profile));
    }

    public async Task<Result<OwnerProfileResponse>> ClarifyAccountType(ClarifyAccountTypeRequest request, CancellationToken ct)
    {
        if (TryReturnUnauthorized<OwnerProfileResponse>(out var unauthorizedAuthResult))
            return unauthorizedAuthResult;

        var existing = await profileRepository.GetProfileByExternalIdAsync(currentUserService.UserId, ct);
        if (existing is null)
            return Result<OwnerProfileResponse>.Failure(new Error(ErrorCode.NotFound, "Profile not found"));

        existing.AccountType = Enum.Parse<AccountType>(request.AccountType, true);
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        await profileRepository.SaveChangesAsync(ct);
        return Result<OwnerProfileResponse>.Success(MapToOwner(existing));
    }

    private bool TryReturnUnauthorized<T>(out Result<T> result)
    {
        if (!currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(currentUserService.UserId))
        {
            result = Result<T>.Failure(new Error(ErrorCode.Unauthorized, "Authorize to access this data"));
            return true;
        }
        result = default!;
        return false;
    }

    private OwnerProfileResponse MapToOwner(Profile profile)
        => new OwnerProfileResponse(
            ProfileExists: true,
            IsVerified: profile.IsVerified,
            IsSeller: profile.AccountType != AccountType.Basic,
            Id: profile.Id,
            DisplayName: profile.DisplayName,
            Email: profile.Email ?? string.Empty,
            PhoneNumber: profile.PhoneNumber ?? string.Empty);

    private CurrentUserMetadataResponse MapToMetadata(Profile profile)
        => new CurrentUserMetadataResponse(
            Id: profile.Id,
            DisplayName: profile.DisplayName,
            PictureUrl: profile.PictureUrl,
            AccountType: profile.AccountType.ToString());
}
