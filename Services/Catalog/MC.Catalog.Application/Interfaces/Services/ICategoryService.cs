using MC.Catalog.Application.Requests;
using MC.Catalog.Domain.Entities;
using MC.Shared.Application.Common;

namespace MC.Catalog.Application.Interfaces.Services;

public interface ICategoryService
{
    Task<Result<Category>> GetFullCategoryTreeAsync(CancellationToken ct);
    Task<Result<Category>> GetCategoryWithChildrenAsync(CancellationToken ct, uint categoryId);
    Task<Result> AddNewCategoryAsync(CancellationToken ct, CreateCategoryRequest request);
    Task<Result> RenameCategoryAsync(CancellationToken ct, RenameCategoryRequest request);
    Task<Result> DeleteCategoryAsync(CancellationToken ct, uint categoryId);
}
