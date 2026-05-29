namespace WebStoreUser.Application.Responses;

public sealed record TokenResponse(string AccessToken, string RefreshToken);
