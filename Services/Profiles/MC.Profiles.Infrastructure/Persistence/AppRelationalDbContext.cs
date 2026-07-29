using Microsoft.EntityFrameworkCore;
using MC.Profiles.Domain.Entities;

namespace MC.Profiles.Infrastructure.Persistence;

public class AppRelationalDbContext(DbContextOptions<AppRelationalDbContext> options) : DbContext(options)
{
    public DbSet<Profile> Profiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Profile>()
            .HasIndex(p => p.Auth0UserId)
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}
