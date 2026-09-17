using MC.Profiles.Domain.Entities;

namespace MC.Profiles.Application.Interfaces.Repositories;

public interface IProfileRepository
{
    Task<Profile?> GetProfileByIdAsync(Guid id, CancellationToken ct);
    Task<Profile?> GetProfileByExternalIdAsync(string externalUserId, CancellationToken ct);
    Task<Profile> AddOrGetByExternalUserIdAsync(Profile profile, CancellationToken ct);
    Task CreateProfileAsync(Profile profile, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
