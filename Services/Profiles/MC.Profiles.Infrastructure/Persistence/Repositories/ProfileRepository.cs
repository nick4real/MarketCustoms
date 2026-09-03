using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Domain.Entities;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace MC.Profiles.Infrastructure.Persistence.Repositories;

public class ProfileRepository(AppRelationalDbContext relationalDbContext) : IProfileRepository
{
    public async Task<Profile?> GetProfileByExternalIdAsync(string externalId, CancellationToken ct)
        => await relationalDbContext.Profiles.FirstOrDefaultAsync(p => p.ExternalUserId == externalId, ct);

    public async Task<Profile?> GetProfileByIdAsync(Guid id, CancellationToken ct)
        => await relationalDbContext.Profiles.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task CreateProfileAsync(Profile profile, CancellationToken ct)
        => await relationalDbContext.Profiles.AddAsync(profile, ct);

    public async Task<Profile> AddOrGetByExternalUserIdAsync(Profile profile, CancellationToken ct)
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
            var existing = await GetProfileByExternalIdAsync(profile.ExternalUserId, ct);
            if (existing is null)
                throw;

            return existing;
        }
    }

    public async Task SaveChangesAsync(CancellationToken ct)
        => await relationalDbContext.SaveChangesAsync(ct);

    private static bool IsUniqueViolation(DbUpdateException exception)
        => exception.InnerException is SqlException sql && sql.Number is 2601 or 2627;
}
