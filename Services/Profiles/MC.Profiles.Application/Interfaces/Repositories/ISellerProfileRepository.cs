using MC.Profiles.Domain.Entities;

namespace MC.Profiles.Application.Interfaces.Repositories;

public interface ISellerProfileRepository
{
    Task AddAsync(SellerProfile sellerProfile, CancellationToken cancellationToken);
    Task<SellerProfile?> GetByProfileIdAsync(Guid profileId, CancellationToken cancellationToken);
    Task<SellerProfile?> GetActiveByNormalizedShopNameAsync(string shopNameNormalized, CancellationToken cancellationToken);
}
