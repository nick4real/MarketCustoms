namespace MC.Shared.Application.Interfaces.Services;
/// <summary>
/// [Current User pattern] Current user service interface for retrieving information about the currently authenticated user.
/// </summary>
public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    string? PhoneNumber { get; }
    bool IsAuthenticated { get; }
    bool IsSeller { get; }
}
