using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MC.Profiles.Infrastructure.Persistence.Repositories;

public class ProfileRepository(AppRelationalDbContext relationalDbContext) : IProfileRepository
{
    public async Task<Profile?> GetProfileByExternalIdAsync(string externalId) 
        => await relationalDbContext.Profiles.FirstOrDefaultAsync(p => p.ExternalUserId == externalId);

    public async Task<Profile?> GetProfileByIdAsync(Guid id)
        => await relationalDbContext.Profiles.FirstOrDefaultAsync(p => p.Id == id);

    public async Task CreateProfileAsync(Profile profile)
        => await relationalDbContext.Profiles.AddAsync(profile);

    public async Task SaveChangesAsync()
        => await relationalDbContext.SaveChangesAsync();
}
