using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Requests;
using MC.Shared.Application.Common;

namespace MC.Catalog.Application.Interfaces.Services;

public interface ICategoryService
{
    Task<Result<CategoryDto[]>> GetRootCategoriesAsync(CancellationToken ct);
    Task<Result<CategoryDto>> GetCategoryAsync(CancellationToken ct, uint categoryId);
    Task<Result<CategoryDto>> GetCategoryWithChildrenAsync(CancellationToken ct, uint categoryId);
    Task<Result<CategoryDto>> GetCategoryFullTreeAsync(CancellationToken ct, uint categoryId);
    Task<Result> AddNewCategoryAsync(CancellationToken ct, CreateCategoryRequest request);
    Task<Result> RenameCategoryAsync(CancellationToken ct, RenameCategoryRequest request);
    Task<Result> DeleteCategoryAsync(CancellationToken ct, uint categoryId);
}
