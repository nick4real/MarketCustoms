using MC.Shared.Application.Interfaces.Services;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeCurrentUserService : ICurrentUserService
{
    public string? UserId { get; set; }
    public bool IsAuthenticated { get; set; }
    public bool IsSeller { get; set; }
}
