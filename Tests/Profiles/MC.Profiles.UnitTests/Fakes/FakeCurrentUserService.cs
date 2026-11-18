using MC.Shared.Application.Interfaces.Services;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeCurrentUserService : ICurrentUserService
{
    public string? UserId { get; set; }
    public string? Email { get; set; }
    public bool IsAuthenticated { get; set; }
    public Guid? ProfileId { get; set; }
    public HashSet<string> Permissions { get; } = [];

    public bool HasPermission(string permission) => Permissions.Contains(permission);
}
