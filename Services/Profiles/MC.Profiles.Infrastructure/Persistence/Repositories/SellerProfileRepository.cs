using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MC.Profiles.Infrastructure.Persistence.Repositories;

public class SellerProfileRepository(AppRelationalDbContext relationalDbContext) : ISellerProfileRepository
{
    public async Task AddAsync(SellerProfile sellerProfile, CancellationToken cancellationToken) =>
        await relationalDbContext.SellerProfiles.AddAsync(sellerProfile, cancellationToken);

    public async Task<SellerProfile?> GetByProfileIdAsync(Guid profileId, CancellationToken cancellationToken) =>
        await relationalDbContext.SellerProfiles.FirstOrDefaultAsync(
            seller => seller.ProfileId == profileId,
            cancellationToken);

    public async Task<SellerProfile?> GetActiveByNormalizedShopNameAsync(
        string shopNameNormalized,
        CancellationToken cancellationToken) =>
        await relationalDbContext.SellerProfiles.FirstOrDefaultAsync(
            seller => seller.IsActive && seller.ShopNameNormalized == shopNameNormalized,
            cancellationToken);
}
