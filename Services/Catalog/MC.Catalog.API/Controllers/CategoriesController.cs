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
    public async Task<IActionResult> GetFullRootCategory(CancellationToken ct)
    {
        var categoryResult = await categoryService.GetFullCategoryTreeAsync(ct);
        return HandleResult(categoryResult);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCategory(CancellationToken ct, [FromBody] CreateCategoryRequest request)
    {
        var result = await categoryService.AddNewCategoryAsync(ct, request);
        return HandleResult(result);
    }
}
