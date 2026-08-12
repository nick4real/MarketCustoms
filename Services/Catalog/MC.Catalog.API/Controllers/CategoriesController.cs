using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Requests;
using MC.Shared.API.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MC.Catalog.API.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class CategoriesController(ICategoryService categoryService) : CustomController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllRoots(CancellationToken ct)
    {
        var result = await categoryService.GetRootCategoriesAsync(ct);
        return HandleResult(result);
    }

    [HttpGet("{categoryId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategoryById(CancellationToken ct, uint categoryId)
    {
        var result = await categoryService.GetCategoryAsync(ct, categoryId);
        return HandleResult(result);
    }

    [HttpGet("children/{categoryId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategoryWithChildren(CancellationToken ct, uint categoryId)
    {
        var result = await categoryService.GetCategoryWithChildrenAsync(ct, categoryId);
        return HandleResult(result);
    }

    [HttpGet("tree/{categoryId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategoryFullTree(CancellationToken ct, uint categoryId)
    {
        var result = await categoryService.GetCategoryFullTreeAsync(ct, categoryId);
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory(CancellationToken ct, [FromBody] CreateCategoryRequest request)
    {
        var result = await categoryService.AddNewCategoryAsync(ct, request);
        return HandleResult(result);
    }
}
