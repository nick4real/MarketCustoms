using MC.Profiles.Application.Interfaces.Services;

namespace MC.Profiles.Infrastructure.Services;

public sealed class NoOpIdentityService : IIdentityService
{
    public Task GrantSellerAsync(string externalUserId, CancellationToken cancellationToken) =>
        Task.CompletedTask;

    public Task SetNameAsync(string externalUserId, string name, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
