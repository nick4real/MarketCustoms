using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Domain.Entities;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeSellerProfileRepository : ISellerProfileRepository
{
    private readonly List<SellerProfile> _profiles = [];

    public IReadOnlyList<SellerProfile> Items => _profiles;

    public Task AddAsync(SellerProfile sellerProfile, CancellationToken cancellationToken)
    {
        _profiles.Add(sellerProfile);
        return Task.CompletedTask;
    }

    public Task<SellerProfile?> GetByProfileIdAsync(Guid profileId, CancellationToken cancellationToken) =>
        Task.FromResult(_profiles.FirstOrDefault(profile => profile.ProfileId == profileId));

    public Task<SellerProfile?> GetActiveByNormalizedShopNameAsync(
        string shopNameNormalized,
        CancellationToken cancellationToken) =>
        Task.FromResult(_profiles.FirstOrDefault(profile =>
            profile.IsActive && profile.ShopNameNormalized == shopNameNormalized));

    public List<SellerProfile> Clone() => [.. _profiles];

    public void Restore(List<SellerProfile> snapshot)
    {
        _profiles.Clear();
        _profiles.AddRange(snapshot);
    }
}
