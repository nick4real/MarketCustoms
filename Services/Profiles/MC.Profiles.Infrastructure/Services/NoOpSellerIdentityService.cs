using MC.Profiles.Application.Interfaces.Services;

namespace MC.Profiles.Infrastructure.Services;

public sealed class NoOpSellerIdentityService : ISellerIdentityService
{
    public Task GrantSellerAsync(string externalUserId, CancellationToken cancellationToken) =>
        Task.CompletedTask;
}
