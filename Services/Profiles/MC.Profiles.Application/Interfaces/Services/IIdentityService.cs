using MC.Shared.Application.Common;

namespace MC.Profiles.Application.Interfaces.Services;
/// <summary>
/// Represents an external Identity Provider for managing user identities and roles.
/// </summary>
public interface IIdentityService
{
    Task<Result> SetProfileIdAsync(string externalUserId, Guid profileId, CancellationToken ct);
    Task<Result> GrantSellerAsync(string externalUserId, CancellationToken ct);
    Task<Result> RevokeSellerAsync(string externalUserId, CancellationToken ct);
    Task SetNameAsync(string externalUserId, string name, CancellationToken ct);
}
