using MC.Profiles.Application.Interfaces.Repositories;
using MC.Profiles.Domain.Entities;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeProfileRepository : IProfileRepository
{
    private readonly List<Profile> _profiles = [];

    public Task<Profile?> GetProfileByExternalIdAsync(string auth0Id)
        => Task.FromResult(_profiles.FirstOrDefault(profile => profile.ExternalUserId == auth0Id));

    public Task<Profile?> GetProfileByIdAsync(Guid id)
        => Task.FromResult(_profiles.FirstOrDefault(profile => profile.Id == id));

    public Task CreateProfileAsync(Profile profile)
    {
        _profiles.Add(profile);
        return Task.CompletedTask;
    }

    public Task<Profile> AddOrGetByExternalUserIdAsync(Profile profile)
    {
        var existing = _profiles.FirstOrDefault(item => item.ExternalUserId == profile.ExternalUserId);
        if (existing is not null)
            return Task.FromResult(existing);

        _profiles.Add(profile);
        return Task.FromResult(profile);
    }

    public Task SaveChangesAsync() => Task.CompletedTask;
}
