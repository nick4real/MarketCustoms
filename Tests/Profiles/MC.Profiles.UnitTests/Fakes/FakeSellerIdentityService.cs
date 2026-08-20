using MC.Profiles.Application.Interfaces.Services;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeSellerIdentityService : IIdentityService
{
    public bool ShouldFail { get; set; }
    public int GrantCount { get; private set; }

    public Task GrantSellerAsync(string externalUserId, CancellationToken cancellationToken)
    {
        GrantCount++;
        if (ShouldFail)
            throw new InvalidOperationException("Auth0 grant failed");

        return Task.CompletedTask;
    }

    public Task SetNameAsync(string externalUserId, string name, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
