using Microsoft.EntityFrameworkCore;
using WebStoreUser.Domain.Entities;

namespace WebStoreUser.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Session> Sessions { get; set; }
}
