namespace MC.Profiles.Application.Interfaces.Services;
/// <summary>
/// Represents an external Identity Provider for managing user identities and roles.
/// </summary>
public interface IIdentityService
{
    Task GrantSellerAsync(string externalUserId, CancellationToken cancellationToken);
    Task SetNameAsync(string externalUserId, string name, CancellationToken cancellationToken);
}
