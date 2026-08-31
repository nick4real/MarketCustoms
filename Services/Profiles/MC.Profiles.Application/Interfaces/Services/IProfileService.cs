using MC.Profiles.Application.Requests;
using MC.Profiles.Application.Responses;
using MC.Shared.Application.Common;

namespace MC.Profiles.Application.Interfaces.Services;

public interface IProfileService
{
    Task<Result<OwnerProfileResponse>> GetMe(CancellationToken ct);
    Task<Result<PublicProfileResponse>> GetProfileInfo(CancellationToken ct, Guid id);
    Task<Result<OwnerProfileResponse>> ClarifyAccountType(ClarifyAccountTypeRequest request, CancellationToken ct);
}
