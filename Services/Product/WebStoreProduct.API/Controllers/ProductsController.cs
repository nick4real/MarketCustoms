using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebStoreProduct.Application.Interfaces.Services;

namespace WebStoreProduct.API.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductsController(IProductService productService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] uint categoryId = 0, [FromQuery] int page = 1, [FromQuery] int size = 12)
    {
        var productsResult = categoryId == 0
            ? await productService.GetProductsAsync(page, size)
            : await productService.GetProductsByCategoryAsync(categoryId, page, size);

        if (!productsResult.IsSuccess)
        {
            return BadRequest(productsResult.Error);
        }

        return Ok(productsResult.Value);
    }

    [HttpGet("{productId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllByCategory(uint productId)
    {
        var productsResult = await productService.GetDetailedProductByIdAsync(productId);
        if (!productsResult.IsSuccess)
        {
            return BadRequest(productsResult.Error);
        }

        return Ok(productsResult.Value);
    }
}
