using Microsoft.EntityFrameworkCore;
using MC.Profiles.Domain.Entities;

namespace MC.Profiles.Infrastructure.Persistence;

public class AppRelationalDbContext(DbContextOptions<AppRelationalDbContext> options) : DbContext(options)
{
    public DbSet<Profile> Profiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Profile>()
            .HasKey(p => p.Id);

        modelBuilder.Entity<Profile>()
            .HasIndex(p => p.ExternalUserId)
            .IsUnique();

        modelBuilder.Entity<Profile>()
            .HasIndex(p => p.Email)
            .IsUnique();

        modelBuilder.Entity<Profile>()
            .HasIndex(p => p.PhoneNumber)
            .IsUnique();
    }
}
