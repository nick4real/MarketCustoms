using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MC.Profiles.Infrastructure.Persistence.Repositories;

public class SellerApplicationRepository(AppRelationalDbContext relationalDbContext) : ISellerApplicationRepository
{
    public async Task AddAsync(SellerApplication application, CancellationToken cancellationToken) =>
        await relationalDbContext.SellerApplications.AddAsync(application, cancellationToken);

    public async Task<SellerApplication?> GetLatestByProfileIdAsync(Guid profileId, CancellationToken cancellationToken) =>
        await relationalDbContext.SellerApplications
            .Where(application => application.ProfileId == profileId)
            .OrderByDescending(application => application.SubmittedAt)
            .FirstOrDefaultAsync(cancellationToken);
}
