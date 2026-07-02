using Microsoft.AspNetCore.Identity;
using WebStoreUser.Application.Interfaces.Repositories;
using WebStoreUser.Application.Interfaces.Services;
using WebStoreUser.Application.Requests;
using WebStoreUser.Application.Responses;
using WebStoreUser.Application.Validators.Auth;
using WebStoreUser.Domain.Entities;
using WebStoreUser.Domain.Enums;

namespace WebStoreUser.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    ISessionRepository sessionRepository,
    IPasswordHasherService passwordHasherService,
    ITokenGenerator tokenGenerator) : IAuthService
{
    // Interface implementation
    public async Task<TokenResponse> LoginAsync(UserLoginRequest request, CancellationToken ct)
    {
        if (request.Login.Length > 20 && !request.Login.IsEmail())
            return null;

        var user = await userRepository.GetByLoginAsync(request.Login, ct);
        if (user is null) return null;

        var isVerified = passwordHasherService.VerifyPassword(request.Password, user.PasswordHash);
        if (!isVerified) return null;

        var response = new TokenResponse
        (
            tokenGenerator.CreateAccessToken(user),
            tokenGenerator.CreateRefreshToken()
        );

        var session = new Session
        {
            UserId = user.Id,
            RefreshToken = response.RefreshToken,
            Expires = DateTime.UtcNow.AddDays(7),
            IsRevoked = false
        };

        await sessionRepository.AddAsync(session, ct);
        await sessionRepository.SaveChangesAsync(ct);
        return response;
    }

    public async Task<bool> LogoutAsync()
    {
        throw new NotImplementedException(); // TODO: Logout
    }

    public async Task<TokenResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken ct)
    {
        var session = await sessionRepository.GetActiveJoinUserAsync(request.UserId, request.RefreshToken ,ct);
        if (session == null || session.User == null) return null;

        var response = new TokenResponse
        (
            tokenGenerator.CreateAccessToken(session.User),
            tokenGenerator.CreateRefreshToken()
        );

        session.RefreshToken = response.RefreshToken;
        session.Expires = DateTime.UtcNow.AddDays(7);

        await sessionRepository.SaveChangesAsync(ct);
        return response;
    }

    public async Task<bool> RegisterAsync(UserRegisterRequest request, CancellationToken ct)
    {
        // TODO: Can be optimized when SharpGrip.FluentValidation.AutoValidation.Mvc support for .NET 10 is released
        if (await userRepository.IsLoginExistsAsync(request.Username, request.Email, ct))
            return false;

        await userRepository.AddAsync(new User()
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHasherService.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow,
            Role = UserRole.Customer
        }, ct);
        await sessionRepository.SaveChangesAsync(ct);
        return true;
    }
}
