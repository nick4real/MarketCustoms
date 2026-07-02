namespace WebStoreUser.Application.Requests;

public sealed record RefreshTokenRequest(Guid UserId, string RefreshToken);