using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Models;
using MC.Catalog.Application.Requests;
using MC.Catalog.Application.Responses;
using MC.Shared.Application.Common;

namespace MC.Catalog.Application.Interfaces.Services;

public interface IProductService
{
    Task<Result<PaginatedResponse<ProductCatalogViewDto>>> GetProductsAsync(CancellationToken ct, PaginationParams paginationParams, ProductParams? productParams);
    Task<Result<ProductDetailedResponse>> GetDetailedProductByIdAsync(string id, CancellationToken ct);
    Task<Result<ProductDetailedResponse>> CreateProductAsync(CreateProductRequest product, CancellationToken ct);
}
