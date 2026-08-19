using MC.Profiles.Domain.Entities;

namespace MC.Profiles.Application.Interfaces.Repositories;

public interface IProfileRepository
{
    Task<Profile?> GetProfileByExternalIdAsync(string auth0Id);
    Task<Profile?> GetProfileByIdAsync(Guid id);
    Task CreateProfileAsync(Profile profile);
    Task<Profile> AddOrGetByExternalUserIdAsync(Profile profile);
    Task SaveChangesAsync();
}
