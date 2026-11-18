using MC.Profiles.Application.Interfaces.Services;
using MC.Shared.Application.Common;

namespace MC.Profiles.Infrastructure.Services;

public sealed class NoOpIdentityService : IIdentityService
{
    public Task<Result> SetProfileIdAsync(string externalUserId, Guid profileId, CancellationToken ct) =>
        Task.FromResult(Result.Success());

    public Task<Result> GrantSellerAsync(string externalUserId, CancellationToken ct) =>
        Task.FromResult(Result.Success());

    public Task<Result> RevokeSellerAsync(string externalUserId, CancellationToken ct) =>
        Task.FromResult(Result.Success());

    public Task SetNameAsync(string externalUserId, string name, CancellationToken ct)
    {
        throw new NotImplementedException();
    }
}
