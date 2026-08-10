using MC.Catalog.Domain.Entities;

namespace MC.Catalog.Application.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<Category?> GetCategoryAsync(CancellationToken ct, uint categoryId);
    Task<Category?> GetCategoryWithChildrenAsync(CancellationToken ct, uint categoryId);
    Task<Category?> GetFullRootCategoryWithChildrenAsync(CancellationToken ct);
    Task AddCategoryAsync(CancellationToken ct, Category category);
    Task DeleteCategoryAsync(CancellationToken ct, Category category);
    Task SaveChangesAsync(CancellationToken ct);
}
