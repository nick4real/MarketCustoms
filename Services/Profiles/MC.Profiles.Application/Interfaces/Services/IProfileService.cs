using MC.Profiles.Application.Requests;
using MC.Profiles.Application.Responses;
using MC.Shared.Application.Common;

namespace MC.Profiles.Application.Interfaces.Services;

public interface IProfileService
{
    Task<Result<OwnerProfileResponse>> GetMe(CancellationToken ct);
    Task<Result<PublicProfileResponse>> GetProfileInfo(CancellationToken ct, Guid id);
    Task<Result<OwnerProfileResponse>> CompleteClarification(CompleteClarificationRequest request, CancellationToken ct);
    Task<Result> RequireVerifiedProfile(CancellationToken ct);
    Task<Result<OwnerSellerResponse>> SubmitSellerApplication(SubmitSellerApplicationRequest request, CancellationToken ct);
    Task<Result<OwnerSellerResponse>> GetMySellerStatus(CancellationToken ct);
}
