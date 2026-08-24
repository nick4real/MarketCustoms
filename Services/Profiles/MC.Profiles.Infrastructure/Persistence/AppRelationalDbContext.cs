using MC.Profiles.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MC.Profiles.Infrastructure.Persistence;

public class AppRelationalDbContext(DbContextOptions<AppRelationalDbContext> options) : DbContext(options)
{
    public DbSet<Profile> Profiles { get; set; }
    public DbSet<SellerApplication> SellerApplications { get; set; }
    public DbSet<SellerProfile> SellerProfiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Profile>()
            .HasKey(p => p.Id);

        modelBuilder.Entity<Profile>()
            .HasIndex(p => p.ExternalUserId)
            .IsUnique();

        modelBuilder.Entity<Profile>()
            .HasMany(profile => profile.SellerApplications)
            .WithOne(application => application.Profile)
            .HasForeignKey(application => application.ProfileId);

        modelBuilder.Entity<Profile>()
            .HasOne(profile => profile.SellerProfile)
            .WithOne(seller => seller.Profile)
            .HasForeignKey<SellerProfile>(seller => seller.ProfileId);

        modelBuilder.Entity<SellerProfile>()
            .HasIndex(seller => seller.ProfileId)
            .IsUnique();

        modelBuilder.Entity<SellerProfile>()
            .HasIndex(seller => seller.ShopNameNormalized)
            .IsUnique()
            .HasFilter("[IsActive] = 1");

        modelBuilder.Entity<SellerApplication>()
            .HasIndex(application => new { application.ProfileId, application.CreatedAt });
    }
}
