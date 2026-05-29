using WebStoreUser.Application.Requests;
using WebStoreUser.Application.Responses;

namespace WebStoreUser.Application.Interfaces.Services;

public interface IAuthService
{
    Task<bool> RegisterAsync(UserRegisterRequest request, CancellationToken ct);
    Task<TokenResponse> LoginAsync(UserLoginRequest request, CancellationToken ct);
    Task<bool> LogoutAsync();
    Task<TokenResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken ct);
}
