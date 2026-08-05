namespace MC.Shared.Application.Interfaces.Services;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    string? TenantId { get; }
    bool IsAuthenticated { get; }
    bool IsInRole(string role);
}
