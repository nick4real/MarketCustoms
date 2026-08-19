namespace MC.Shared.Application.Interfaces.Services;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    string? PhoneNumber { get; }
    bool IsAuthenticated { get; }
    bool IsSeller { get; }
}
