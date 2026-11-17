using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Domain.Entities;

namespace MC.Catalog.UnitTests.Fakes;

internal sealed class FakeCategoryRepository : ICategoryRepository
{
    private readonly List<Category> _categories = [];
    private uint _nextId = 1;

    public Task<Category?> GetCategoryAsync(CancellationToken ct, uint categoryId)
        => Task.FromResult(_categories.FirstOrDefault(category => category.Id == categoryId));

    public Task<Category?> GetCategoryFullTreeAsync(CancellationToken ct, uint categoryId)
        => GetCategoryAsync(ct, categoryId);

    public Task<Category?> GetCategoryWithChildrenAsync(CancellationToken ct, uint categoryId)
        => GetCategoryAsync(ct, categoryId);

    public Task<Category[]?> GetCategoryExpandedAsync(CancellationToken ct, uint categoryId)
    {
        var result = new List<Category>();
        var pending = new Queue<uint>([categoryId]);

        while (pending.Count > 0)
        {
            var currentId = pending.Dequeue();
            var current = _categories.FirstOrDefault(category => category.Id == currentId);
            if (current is null)
            {
                continue;
            }

            result.Add(current);
            foreach (var child in _categories.Where(category => category.ParentCategoryId == currentId))
            {
                pending.Enqueue(child.Id);
            }
        }

        return Task.FromResult<Category[]?>(result.ToArray());
    }

    public Task<Category[]?> GetRootCategoriesAsync(CancellationToken ct)
        => Task.FromResult<Category[]?>(_categories.Where(category => category.ParentCategoryId is null).ToArray());

    public Task AddCategoryAsync(CancellationToken ct, Category category)
    {
        if (category.Id == 0)
        {
            category.Id = _nextId++;
        }

        _categories.Add(category);
        return Task.CompletedTask;
    }

    public Task DeleteCategoryAsync(CancellationToken ct, Category category)
    {
        _categories.Remove(category);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct) => Task.CompletedTask;
}
