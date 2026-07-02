using WebStoreUser.Domain.Entities;

namespace WebStoreUser.Application.Interfaces.Repositories;

public interface ISessionRepository
{
    Task<IReadOnlyList<Session>?> GetAllActiveByIdAsync(Guid userId, CancellationToken ct);
    Task<Session?> GetActiveJoinUserAsync(Guid userId, string refreshToken, CancellationToken ct);
    Task AddAsync(Session session, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
}
