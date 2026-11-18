using MC.Profiles.Application.Interfaces.Services;
using MC.Shared.Application.Common;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeIdentityService : IIdentityService
{
    public List<string> Calls { get; } = [];
    public Result? FailWith { get; set; }

    public Task<Result> SetProfileIdAsync(string externalUserId, Guid profileId, CancellationToken ct)
        => Record($"profile-id:{externalUserId}:{profileId}");

    public Task<Result> GrantSellerAsync(string externalUserId, CancellationToken ct)
        => Record($"grant:{externalUserId}");

    public Task<Result> RevokeSellerAsync(string externalUserId, CancellationToken ct)
        => Record($"revoke:{externalUserId}");

    public Task SetNameAsync(string externalUserId, string name, CancellationToken ct)
        => Task.CompletedTask;

    private Task<Result> Record(string call)
    {
        Calls.Add(call);
        return Task.FromResult(FailWith ?? Result.Success());
    }
}
