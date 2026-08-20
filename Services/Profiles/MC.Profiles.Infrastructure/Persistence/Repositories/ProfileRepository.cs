using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Domain.Entities;
using Microsoft.Data.SqlClient;
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

    public async Task<Profile> AddOrGetByExternalUserIdAsync(Profile profile)
    {
        try
        {
            await relationalDbContext.Profiles.AddAsync(profile);
            await relationalDbContext.SaveChangesAsync();
            return profile;
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            relationalDbContext.Entry(profile).State = EntityState.Detached;
            var existing = await GetProfileByExternalIdAsync(profile.ExternalUserId);
            if (existing is null)
                throw;

            return existing;
        }
    }

    public async Task SaveChangesAsync()
        => await relationalDbContext.SaveChangesAsync();

    private static bool IsUniqueViolation(DbUpdateException exception) 
        => exception.InnerException is SqlException sql && sql.Number is 2601 or 2627;
}
