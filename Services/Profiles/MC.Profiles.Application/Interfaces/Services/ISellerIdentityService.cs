namespace MC.Profiles.Application.Interfaces.Services;

public interface ISellerIdentityService
{
    Task GrantSellerAsync(string externalUserId, CancellationToken cancellationToken);
}
