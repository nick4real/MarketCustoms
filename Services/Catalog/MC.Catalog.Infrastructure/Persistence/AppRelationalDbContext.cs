using MC.Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MC.Catalog.Infrastructure.Persistence;

public class AppRelationalDbContext : DbContext
{
    public AppRelationalDbContext(DbContextOptions<AppRelationalDbContext> options) : base(options)
    { }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>()
            .HasMany(c => c.ChildCategories)
            .WithOne(c => c.ParentCategory)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
