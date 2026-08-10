using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MC.Catalog.Infrastructure.Persistence.Repositories;

public class CategoryRepository(AppRelationalDbContext relationalDbContext) : ICategoryRepository
{
    public async Task AddCategoryAsync(CancellationToken ct, Category category)
    {
        await relationalDbContext.AddAsync(category);
    }

    public async Task DeleteCategoryAsync(CancellationToken ct, Category category)
    {
        relationalDbContext.Remove(category);
    }

    public async Task<Category?> GetCategoryAsync(CancellationToken ct, uint categoryId)
    {
        return await relationalDbContext.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);
    }

    public async Task<Category?> GetCategoryWithChildrenAsync(CancellationToken ct, uint categoryId)
    {
        var allCategories = await relationalDbContext.Categories.ToArrayAsync();
        return allCategories.First(c => c.Id == categoryId);
    }

    public async Task<Category?> GetFullRootCategoryWithChildrenAsync(CancellationToken ct)
    {
        var allCategories = await relationalDbContext.Categories.ToListAsync(ct);
        return allCategories.OrderBy(c => c.Id).ToList().SingleOrDefault(c => c.ParentCategoryId == null);
    }

    public async Task SaveChangesAsync(CancellationToken ct) => await relationalDbContext.SaveChangesAsync();
}
