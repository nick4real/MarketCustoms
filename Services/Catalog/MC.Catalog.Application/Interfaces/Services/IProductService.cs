using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Models;
using WebStoreProduct.Application.Responses;

namespace WebStoreProduct.Application.Interfaces.Services;

public interface IProductService
{
    Task<Result<PaginatedResponse<ProductCatalogViewDto>>> GetProductsAsync(CancellationToken ct, PaginationParams paginationParams, ProductParams productParams);
    Task<Result<ProductDetailedResponse>> GetDetailedProductByIdAsync(uint id, CancellationToken ct);
}
