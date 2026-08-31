using MC.Profiles.Domain.Entities;

namespace MC.Profiles.Application.Interfaces.Repositories;

public interface IProfileRepository
{
    Task<Profile?> GetProfileByIdAsync(Guid id);
    Task<Profile?> GetProfileByExternalIdAsync(string auth0Id);
    Task<Profile> AddOrGetByExternalUserIdAsync(Profile profile);
    Task CreateProfileAsync(Profile profile);
    Task SaveChangesAsync();
}
