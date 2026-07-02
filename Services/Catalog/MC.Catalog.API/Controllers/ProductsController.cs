using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Models;
using MC.Catalog.Application.Requests;

namespace MC.Catalog.API.Controllers;

[ApiController]
[Route("[controller]")]
public class ProductsController(IProductService productService) : CustomController
{
    [AllowAnonymous]
    [HttpGet("{productId}")]
    public async Task<IActionResult> GetById(CancellationToken ct, string productId)
    {
        var productsResult = await productService.GetDetailedProductByIdAsync(productId, ct);
        return HandleResult(productsResult);
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct, [FromQuery] PaginationParams paginationParams = default!)
    {
        var productsResult = await productService.GetProductsAsync(ct, paginationParams, null!);
        return HandleResult(productsResult);
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> GetAllByParams(CancellationToken ct, [FromBody] ProductParams productParams, [FromQuery] PaginationParams paginationParams = default!)
    {
        var productsResult = await productService.GetProductsAsync(ct, paginationParams, productParams);
        return HandleResult(productsResult);
    }

    // TODO: Implement authentication
    [AllowAnonymous]
    [HttpPost("create")]
    public async Task<IActionResult> CreateProduct(CancellationToken ct, [FromBody] CreateProductRequest product)
    {
        var result = await productService.CreateProductAsync(product, ct);
        return HandleResult(result);
    }
}
