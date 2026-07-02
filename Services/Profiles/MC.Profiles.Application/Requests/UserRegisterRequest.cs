namespace WebStoreUser.Application.Requests;

public sealed record UserRegisterRequest(string Username, string Email, string Password);
