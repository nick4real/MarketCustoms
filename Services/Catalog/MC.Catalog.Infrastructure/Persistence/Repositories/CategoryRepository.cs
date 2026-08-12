using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MC.Catalog.Infrastructure.Persistence.Repositories;

public class CategoryRepository(AppRelationalDbContext relationalDbContext) : ICategoryRepository
{
    public async Task<Category?> GetCategoryAsync(CancellationToken ct, uint categoryId)
        => await relationalDbContext.Categories.FirstOrDefaultAsync(c => c.Id == categoryId, ct);

    public async Task<Category?> GetCategoryWithChildrenAsync(CancellationToken ct, uint categoryId)
        => await relationalDbContext.Categories
        .Include(c => c.ChildCategories)
        .FirstOrDefaultAsync(c => c.Id == categoryId, ct);

    public async Task<Category?> GetCategoryFullTreeAsync(CancellationToken ct, uint categoryId)
        => (await relationalDbContext.Categories
        .FromSqlRaw(@"
            WITH CategoryTree AS (
                -- Anchor member: Select root category
                SELECT * FROM Categories WHERE Id = {0}
                UNION ALL
                -- Recursive member: Select child categories
                SELECT c.* 
                FROM Categories c
                INNER JOIN CategoryTree ct ON c.ParentCategoryId = ct.Id
            )
            SELECT * FROM CategoryTree", categoryId)
        .ToArrayAsync(ct))
        .FirstOrDefault();

    public async Task<Category[]?> GetRootCategoriesAsync(CancellationToken ct)
        => await relationalDbContext.Categories.Where(c => c.ParentCategoryId == null).ToArrayAsync(ct);

    public async Task AddCategoryAsync(CancellationToken ct, Category category)
        => await relationalDbContext.Categories.AddAsync(category, ct);

    public async Task DeleteCategoryAsync(CancellationToken ct, Category category)
        => await relationalDbContext.Database.ExecuteSqlAsync($@"
            WITH CategoryTree AS (
                SELECT Id 
                FROM Categories 
                WHERE Id = {category.Id}

                UNION ALL

                SELECT c.Id 
                FROM Categories c
                INNER JOIN CategoryTree ct ON c.ParentCategoryId = ct.Id
            )
            DELETE FROM Categories 
            WHERE Id IN (SELECT Id FROM CategoryTree);
        ");

    public async Task SaveChangesAsync(CancellationToken ct) 
        => await relationalDbContext.SaveChangesAsync(ct);
}
