using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Domain.Entities;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeProfileRepository : IProfileRepository
{
    private readonly List<Profile> _profiles = [];

    public int CreateCalls { get; private set; }
    public int SaveCalls { get; private set; }
    public int Count => _profiles.Count;

    public Task<Profile?> GetProfileByExternalIdAsync(string externalUserId, CancellationToken ct)
        => Task.FromResult(_profiles.FirstOrDefault(profile => profile.ExternalUserId == externalUserId));

    public Task<Profile?> GetProfileByIdAsync(Guid id, CancellationToken ct)
        => Task.FromResult(_profiles.FirstOrDefault(profile => profile.Id == id));

    public Task CreateProfileAsync(Profile profile, CancellationToken ct)
    {
        CreateCalls++;
        _profiles.Add(profile);
        return Task.CompletedTask;
    }

    public Task<Profile> AddOrGetByExternalUserIdAsync(Profile profile, CancellationToken ct)
    {
        var existing = _profiles.FirstOrDefault(item => item.ExternalUserId == profile.ExternalUserId);
        if (existing is not null)
            return Task.FromResult(existing);

        _profiles.Add(profile);
        return Task.FromResult(profile);
    }

    public Task SaveChangesAsync(CancellationToken ct)
    {
        SaveCalls++;
        return Task.CompletedTask;
    }
}
