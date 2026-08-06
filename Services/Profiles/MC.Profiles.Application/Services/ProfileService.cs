using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Application.Interfaces.Services;
using MC.Profiles.Application.Responses;
using MC.Profiles.Domain.Entities;
using MC.Shared.Application.Common;
using MC.Shared.Application.Interfaces.Services;

namespace MC.Profiles.Application.Services;

public class ProfileService(IProfileRepository profileRepository, ICurrentUserService currentUserService) : IProfileService
{
    public async Task<Result<ProfileInfoResponse>> GetMe(CancellationToken ct)
    {
        if (!currentUserService.IsAuthenticated || String.IsNullOrWhiteSpace(currentUserService.UserId))
            return Result<ProfileInfoResponse>.Failure(new Error(ErrorCode.Unauthorized, "Authorize to access this data"));

        var profile = await profileRepository.GetProfileByExternalIdAsync(currentUserService.UserId);
        if (profile == null)
        {
            profile = new Profile
            {
                Id = Guid.NewGuid(),
                ExternalUserId = currentUserService.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await profileRepository.CreateProfileAsync(profile);
            await profileRepository.SaveChangesAsync();
        }

        return Result<ProfileInfoResponse>.Success(new ProfileInfoResponse(
            profile.DisplayName, 
            profile.PhoneNumber ?? string.Empty, 
            profile.Email ?? string.Empty));
    }

    public async Task<Result<ProfileInfoResponse>> GetProfileInfo(CancellationToken ct, Guid id)
    {
        var profile = await profileRepository.GetProfileByIdAsync(id);
        if (profile == null)
            return Result<ProfileInfoResponse>.Failure(new Error(ErrorCode.NotFound, "Profile not found"));

        var response = new ProfileInfoResponse(
            profile.DisplayName,
            profile.IsPhonePublic ? profile.PhoneNumber ?? string.Empty : "Hidden",
            profile.IsEmailPublic ? profile.Email ?? string.Empty : "Hidden");

        return Result<ProfileInfoResponse>.Success(response);
    }
}
