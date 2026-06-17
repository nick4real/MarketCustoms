using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Models;

namespace MC.Catalog.API.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductsController(IProductService productService) : CustomController
{
    [HttpGet("{productId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllByCategory(CancellationToken ct, string productId)
    {
        var productsResult = await productService.GetDetailedProductByIdAsync(productId, ct);
        return HandleResult(productsResult);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken ct, [FromQuery] PaginationParams paginationParams = default!)
    {
        var productsResult = await productService.GetProductsAsync(ct, paginationParams, null!);
        return HandleResult(productsResult);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllByParams(CancellationToken ct, [FromBody] ProductParams productParams, [FromQuery] PaginationParams paginationParams = default!)
    {
        var productsResult = await productService.GetProductsAsync(ct, paginationParams, productParams);
        return HandleResult(productsResult);
    }
}
