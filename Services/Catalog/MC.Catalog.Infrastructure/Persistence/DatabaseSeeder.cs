using MC.Catalog.Domain.Entities;
using MC.Shared.Infrastructure.Interfaces.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MC.Catalog.Infrastructure.Persistence;

public class DatabaseSeeder(AppRelationalDbContext relContext) : IDatabaseSeeder
{
    public async Task SeedAsync()
    {
        var allMigrations = relContext.Database.GetMigrations().ToList();
        var appliedMigrations = (await relContext.Database.GetAppliedMigrationsAsync()).ToList();

        // Mismatch if:
        // 1) there are pending migrations, OR
        // 2) DB has migrations not present in code (e.g. due to branch switch)
        var hasPending = allMigrations.Except(appliedMigrations).Any();
        var hasUnknownApplied = appliedMigrations.Except(allMigrations).Any();

        if (hasPending)
        {
            await relContext.Database.MigrateAsync();
        }
        else if (hasUnknownApplied)
        {
            await relContext.Database.EnsureDeletedAsync();
            await relContext.Database.MigrateAsync();
        }

        // Skip data seeding if no migrations were applied
        if (!hasPending && !hasUnknownApplied) return;

        Task[] tasks =
        {
            Task.Run(SeedCategoriesAsync)
        };
        
        await Task.WhenAll(tasks);
    }

    private async Task SeedCategoriesAsync()
    {
        if (await relContext.Categories.AnyAsync()) return;

        var categories = new List<Category>
        {
            new Category
            {
                Name = "Electronics",
                ChildCategories = new List<Category>
                {
                    new Category
                    {
                        Name = "Computers & Laptops",
                        ChildCategories = new List<Category>
                        {
                            new Category { Name = "Laptops" }
                        }
                    },
                    new Category { Name = "Audio & Headphones" }
                }
            },
            new Category
            {
                Name = "Books",
                ChildCategories = new List<Category>
                {
                    new Category {Name = "Fiction" },
                    new Category
                    {
                        Name = "Computers & Technology",
                        ChildCategories = new List<Category>
                        {
                            new Category { Name = ".NET & C#" }
                        }
                    }
                }
            },
            new Category
            {
                Name = "Clothing",
                ChildCategories = new List<Category>
                {
                    new Category { Name = "Men's Apparel" },
                    new Category { Name = "Women's Apparel" }
                }
            },
            new Category
            {
                Name = "Home & Kitchen",
                ChildCategories = new List<Category>
                {
                    new Category { Name = "Kitchen Appliances" }
                }
            },
            new Category
            {
                Name = "Sports & Outdoors",
                ChildCategories = new List<Category>
                {
                    new Category { Name = "Camping & Hiking" }
                }
            }
        };

        await relContext.Categories.AddRangeAsync(categories);
        await relContext.SaveChangesAsync();
    }
}
