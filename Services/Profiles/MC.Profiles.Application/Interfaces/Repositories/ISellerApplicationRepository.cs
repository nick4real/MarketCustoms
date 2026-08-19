using MC.Profiles.Domain.Entities;

namespace MC.Profiles.Application.Interfaces.Repositories;

public interface ISellerApplicationRepository
{
    Task AddAsync(SellerApplication application, CancellationToken cancellationToken);
    Task<SellerApplication?> GetLatestByProfileIdAsync(Guid profileId, CancellationToken cancellationToken);
}
