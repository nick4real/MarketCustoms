using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Requests;
using MC.Catalog.Domain.Entities;
using MC.Shared.Application.Common;

namespace MC.Catalog.Application.Services;

public class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
{
    public async Task<Result> AddNewCategoryAsync(CancellationToken ct, CreateCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure(new Error(ErrorCode.ValidationFailed, "Category name cannot be empty."));

        var parentCategory = await categoryRepository.GetCategoryAsync(ct, request.ParentId);
        if (parentCategory == null)
            return Result.Failure(new Error(ErrorCode.NotFound, "Parent category not found."));

        var category = new Category
        {
            ParentCategoryId = request.ParentId,
            Name = request.Name,
        };

        await categoryRepository.AddCategoryAsync(ct, category);
        await categoryRepository.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result> DeleteCategoryAsync(CancellationToken ct, uint categoryId)
    {
        var category = await categoryRepository.GetCategoryAsync(ct, categoryId);
        if (category == null)
            return Result.Failure(new Error(ErrorCode.NotFound, "Category not found."));

        await categoryRepository.DeleteCategoryAsync(ct, category);
        await categoryRepository.SaveChangesAsync(ct);

        return Result.Success();
    }

    public async Task<Result<Category>> GetCategoryWithChildrenAsync(CancellationToken ct, uint categoryId)
    {
        var category = await categoryRepository.GetCategoryWithChildrenAsync(ct, categoryId);
        if (category == null)
            return Result<Category>.Failure(new Error(ErrorCode.NotFound, "Category not found."));

        return Result<Category>.Success(category);
    }

    public async Task<Result<Category>> GetFullCategoryTreeAsync(CancellationToken ct)
    {
        var category = await categoryRepository.GetFullRootCategoryWithChildrenAsync(ct);
        if (category == null)
            return Result<Category>.Failure(new Error(ErrorCode.NotFound, "Root category not found."));

        return Result<Category>.Success(category);
    }

    public async Task<Result> RenameCategoryAsync(CancellationToken ct, RenameCategoryRequest request)
    {
        var category = await categoryRepository.GetCategoryAsync(ct, request.CategoryId);
        if (category == null)
            return Result.Failure(new Error(ErrorCode.NotFound, "Category not found."));

        category.Name = request.Name;
        await categoryRepository.SaveChangesAsync(ct);

        return Result.Success();
    }
}
