using Microsoft.EntityFrameworkCore;
using WebStoreUser.Domain.Entities;

namespace WebStoreUser.Infrastructure.Persistence;

public class AppRelationalDbContext(DbContextOptions<AppRelationalDbContext> options) : DbContext(options)
{
    public DbSet<Profile> Profiles { get; set; }
}
