using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Domain.Entities;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeSellerApplicationRepository : ISellerApplicationRepository
{
    private readonly List<SellerApplication> _applications = [];

    public IReadOnlyList<SellerApplication> Items => _applications;

    public Task AddAsync(SellerApplication application, CancellationToken cancellationToken)
    {
        _applications.Add(application);
        return Task.CompletedTask;
    }

    public Task<SellerApplication?> GetLatestByProfileIdAsync(Guid profileId, CancellationToken cancellationToken) =>
        Task.FromResult(_applications
            .Where(application => application.ProfileId == profileId)
            .OrderByDescending(application => application.SubmittedAt)
            .FirstOrDefault());

    public List<SellerApplication> Clone() => [.. _applications];

    public void Restore(List<SellerApplication> snapshot)
    {
        _applications.Clear();
        _applications.AddRange(snapshot);
    }
}
