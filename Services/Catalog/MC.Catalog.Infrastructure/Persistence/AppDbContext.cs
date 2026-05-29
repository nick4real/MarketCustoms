using Bogus;
using Microsoft.EntityFrameworkCore;
using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    { }
    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<ImageLink> ImageLinks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Category>()
            .HasMany(c => c.ChildCategories)
            .WithOne(c => c.ParentCategory)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.NoAction);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseAsyncSeeding(async (context, _, ct) =>
        {
            Random rnd = new Random();

            if (!context.Set<ImageLink>().Any())
            {
                var imagesFaker = new Faker<ImageLink>()
                    .RuleFor(i => i.Url, f => f.Image.PicsumUrl());

                var images = imagesFaker.Generate(30);

                await context.Set<ImageLink>().AddRangeAsync(images, ct);
                await context.SaveChangesAsync(ct);
            }

            if (!context.Set<Category>().Any())
            {
                var categoriesFaker = new Faker<Category>()
                    .RuleFor(c => c.Name, f => f.Commerce.Categories(1).First());

                int pointer = 0;
                var categories = categoriesFaker.Generate(7);

                var tmp = categories[pointer++];
                tmp.ChildCategories = new List<Category>();
                for (int i = 0; i < 2; i++)
                {
                    var tmp1 = categories[pointer++];
                    tmp1.ParentCategoryId = tmp.Id;
                    tmp1.ParentCategory = tmp;
                    tmp.ChildCategories.Add(tmp1);
                    tmp1.ChildCategories = new List<Category>();
                    for (int j = 0; j < 2; j++)
                    {
                        var tmp2 = categories[pointer++];
                        tmp2.ParentCategoryId = tmp1.Id;
                        tmp2.ParentCategory = tmp1;
                        tmp1.ChildCategories.Add(tmp2);
                        tmp2.ChildCategories = new List<Category>();
                    }
                }

                await context.Set<Category>().AddRangeAsync(categories, ct);
                await context.SaveChangesAsync(ct);
            }

            if (!context.Set<Product>().Any())
            {
                var productsFaker = new Faker<Product>()
                    .RuleFor(p => p.Title, f => f.Commerce.ProductName())
                    .RuleFor(p => p.Description, f => f.Commerce.ProductDescription())
                    .RuleFor(p => p.CategoryId, f => (uint)rnd.Next(1, 7))
                    .RuleFor(p => p.CreatedAt, f => DateTime.Now.AddDays(-rnd.Next(1, 700)))
                    .RuleFor(p => p.Price, f => rnd.Next(10, 1000))
                    .RuleFor(p => p.StockQuantity, f => rnd.Next(10, 100))
                    .RuleFor(p => p.StockQuantity, f => rnd.Next(10, 100));

                var products = productsFaker.Generate(15);
                var pointer = 0;

                foreach (var p in products)
                {
                    p.Images = new List<ImageLink>();
                    for (int i = 0; i < 2; i++)
                    {
                        p.Images.Add(context.Set<ImageLink>().Skip(pointer++).First()!);
                    }
                }

                await context.Set<Product>().AddRangeAsync(products, ct);
                await context.SaveChangesAsync(ct);
            }
        });
    }
}
