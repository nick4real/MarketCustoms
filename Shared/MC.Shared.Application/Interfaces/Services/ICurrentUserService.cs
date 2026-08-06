namespace MC.Shared.Application.Interfaces.Services;

public interface ICurrentUserService
{
    string? UserId { get; }
    bool IsAuthenticated { get; }
    bool IsSeller { get; }
}
