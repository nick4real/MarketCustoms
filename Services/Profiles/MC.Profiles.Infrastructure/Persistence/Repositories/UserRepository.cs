using Microsoft.EntityFrameworkCore;
using WebStoreUser.Application.Interfaces.Repositories;
using WebStoreUser.Domain.Entities;
using WebStoreUser.Infrastructure;

namespace WebStoreUser.Infrastructure.Persistence.Repositories;

public class UserRepository(AppDbContext dbContext) : IUserRepository
{
    public async Task AddAsync(User user, CancellationToken ct)
        => await dbContext.Users.AddAsync(user, ct);

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct)
        => await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email, ct);

    public async Task<User?> GetByIdAsync(Guid guid, CancellationToken ct)
        => await dbContext.Users.FirstOrDefaultAsync(u => u.Id == guid, ct);

    public async Task<User?> GetByLoginAsync(string login, CancellationToken ct)
        => await dbContext.Users.FirstOrDefaultAsync(u => u.Username == login || u.Email == login, ct);

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken ct)
        => await dbContext.Users.FirstOrDefaultAsync(u => u.Username == username, ct);

    public async Task<bool> IsLoginExistsAsync(string username, string email, CancellationToken ct)
        => await dbContext.Users.AnyAsync(u => u.Username == username || u.Email == email, ct);

    public async Task SaveChangesAsync(CancellationToken ct)
        => await dbContext.SaveChangesAsync(ct);
}
