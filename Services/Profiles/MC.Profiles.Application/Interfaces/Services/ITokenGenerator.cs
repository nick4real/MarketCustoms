using WebStoreUser.Domain.Entities;

namespace WebStoreUser.Application.Interfaces.Services;

public interface ITokenGenerator
{
    string CreateAccessToken(User user);
    string CreateRefreshToken();
}
