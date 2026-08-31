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
        if (!currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(currentUserService.UserId))
            return Result<OwnerProfileResponse>.Failure(new Error(ErrorCode.Unauthorized, "Authorize to access this data"));

        var profile = await profileRepository.GetProfileByExternalIdAsync(currentUserService.UserId);
        if (profile == null)
            return Result<OwnerProfileResponse>.Success(OwnerProfileResponse.Missing());

        return Result<OwnerProfileResponse>.Success(MapOwner(profile));
    }

    public async Task<Result<PublicProfileResponse>> GetProfileInfo(CancellationToken ct, Guid id)
    {
        var profile = await profileRepository.GetProfileByIdAsync(id);
        if (profile == null)
            return Result<PublicProfileResponse>.Failure(new Error(ErrorCode.NotFound, "Profile not found"));

        return Result<PublicProfileResponse>.Success(new PublicProfileResponse(
            Id: profile.Id,
            DisplayName: profile.DisplayName,
            Bio: profile.Bio,
            IsSeller: profile.AccountType != AccountType.Basic));
    }

    public async Task<Result<OwnerProfileResponse>> ClarifyAccountType(ClarifyAccountTypeRequest request, CancellationToken ct)
    {
        if (!currentUserService.IsAuthenticated || string.IsNullOrWhiteSpace(currentUserService.UserId))
            return Result<OwnerProfileResponse>.Failure(new Error(ErrorCode.Unauthorized, "Authorize to access this data"));

        var existing = await profileRepository.GetProfileByExternalIdAsync(currentUserService.UserId);
        if (existing is null)
            return Result<OwnerProfileResponse>.Failure(new Error(ErrorCode.NotFound, "Profile not found"));

        existing.AccountType = Enum.Parse<AccountType>(request.AccountType, true);
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        await profileRepository.SaveChangesAsync();
        return Result<OwnerProfileResponse>.Success(MapOwner(existing));
    }

    private OwnerProfileResponse MapOwner(Profile profile)
        => new OwnerProfileResponse(
            ProfileExists: true,
            IsVerified: profile.IsVerified,
            IsSeller: profile.AccountType != AccountType.Basic,
            Id: profile.Id,
            DisplayName: profile.DisplayName,
            Email: profile.Email ?? string.Empty,
            PhoneNumber: profile.PhoneNumber ?? string.Empty,
            EmailAttestedByIdentity: profile.EmailAttestedByIdentity,
            PhoneAttestedByIdentity: profile.PhoneAttestedByIdentity);

}
