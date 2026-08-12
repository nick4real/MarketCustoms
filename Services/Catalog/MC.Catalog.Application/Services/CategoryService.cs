using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Requests;
using MC.Catalog.Domain.Entities;
using MC.Shared.Application.Common;

namespace MC.Catalog.Application.Services;

public class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
{
    public async Task<Result<CategoryDto[]>> GetRootCategoriesAsync(CancellationToken ct)
    {
        var categories = await categoryRepository.GetRootCategoriesAsync(ct);
        if (categories == null || categories.Length == 0)
            return Result<CategoryDto[]>.Failure(new Error(ErrorCode.NotFound, "No root categories found."));

        var categoryDtos = categories.Select(ToDto).ToArray();
        return Result<CategoryDto[]>.Success(categoryDtos);
    }

    public async Task<Result<CategoryDto>> GetCategoryAsync(CancellationToken ct, uint categoryId)
    {
        var category = await categoryRepository.GetCategoryAsync(ct, categoryId);
        if (category == null)
            return Result<CategoryDto>.Failure(new Error(ErrorCode.NotFound, "Category not found."));

        return Result<CategoryDto>.Success(ToDto(category));
    }

    public async Task<Result<CategoryDto>> GetCategoryWithChildrenAsync(CancellationToken ct, uint categoryId)
    {
        var category = await categoryRepository.GetCategoryWithChildrenAsync(ct, categoryId);
        if (category == null || category.ChildCategories == null || category.ChildCategories.Count == 0)
            return Result<CategoryDto>.Failure(new Error(ErrorCode.NotFound, "Category not found."));

        return Result<CategoryDto>.Success(ToDto(category));
    }

    public async Task<Result<CategoryDto>> GetCategoryFullTreeAsync(CancellationToken ct, uint categoryId)
    {
        var category = await categoryRepository.GetCategoryFullTreeAsync(ct, categoryId);
        if (category == null)
            return Result<CategoryDto>.Failure(new Error(ErrorCode.NotFound, "Category not found."));

        return Result<CategoryDto>.Success(ToDto(category));
    }

    public async Task<Result> AddNewCategoryAsync(CancellationToken ct, CreateCategoryRequest request)
    {
        if (request.ParentId.HasValue)
        {
            var parentCategory = await categoryRepository.GetCategoryAsync(ct, request.ParentId.Value);
            if (parentCategory == null)
                return Result.Failure(new Error(ErrorCode.NotFound, "Parent category not found."));
        }

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure(new Error(ErrorCode.ValidationFailed, "Category name cannot be empty."));

        var category = new Category
        {
            ParentCategoryId = request.ParentId,
            Name = request.Name,
        };

        await categoryRepository.AddCategoryAsync(ct, category);
        await categoryRepository.SaveChangesAsync(ct);

        return Result.Success();
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

    public async Task<Result> DeleteCategoryAsync(CancellationToken ct, uint categoryId)
    {
        var category = await categoryRepository.GetCategoryAsync(ct, categoryId);
        if (category == null)
            return Result.Failure(new Error(ErrorCode.NotFound, "Category not found."));

        await categoryRepository.DeleteCategoryAsync(ct, category);
        await categoryRepository.SaveChangesAsync(ct);

        return Result.Success();
    }

    private CategoryDto ToDto(Category category)
    {
        var dto = new CategoryDto(
            Id: category.Id,
            Name: category.Name,
            ChildCategories: category.ChildCategories?.Select(ToDto).ToList()
        );

        return dto;
    }
}
