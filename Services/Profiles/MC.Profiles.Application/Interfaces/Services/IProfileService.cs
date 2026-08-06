using MC.Profiles.Application.Responses;
using MC.Shared.Application.Common;

namespace MC.Profiles.Application.Interfaces.Services;

public interface IProfileService
{
    Task<Result<ProfileInfoResponse>> GetMe(CancellationToken ct);
    Task<Result<ProfileInfoResponse>> GetProfileInfo(CancellationToken ct, Guid id);
}
