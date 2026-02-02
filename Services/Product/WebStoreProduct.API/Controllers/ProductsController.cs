using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Interfaces.Services;

namespace WebStoreProduct.API.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductsController(IProductService productService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int size = 12, [FromBody] ProductParams productParams = null)
    {
        var productsResult = await productService.GetProductsAsync(page, size, productParams);

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
