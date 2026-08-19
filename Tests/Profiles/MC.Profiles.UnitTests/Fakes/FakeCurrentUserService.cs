using MC.Shared.Application.Interfaces.Services;

namespace MC.Profiles.UnitTests.Fakes;

internal sealed class FakeCurrentUserService : ICurrentUserService
{
    public string? UserId { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public bool IsAuthenticated { get; set; }
    public bool IsSeller { get; set; }
}
