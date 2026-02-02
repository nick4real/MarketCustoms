using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Interfaces.Services;

namespace WebStoreProduct.API.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductsController(IProductService productService) : CustomController
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken ct, [FromQuery] int page = 1, [FromQuery] int size = 12, [FromBody] ProductParams productParams = null)
    {
        var productsResult = await productService.GetProductsAsync(page, size, ct, productParams);
        return HandleResult(productsResult);
    }

    [HttpGet("{productId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllByCategory(CancellationToken ct, uint productId)
    {
        var productsResult = await productService.GetDetailedProductByIdAsync(productId, ct);
        return HandleResult(productsResult);
    }
}
