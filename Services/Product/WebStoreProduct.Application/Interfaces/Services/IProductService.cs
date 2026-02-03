using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.Models;
using WebStoreProduct.Application.Responses;
using WebStoreProduct.Domain.Views;

namespace WebStoreProduct.Application.Interfaces.Services;

public interface IProductService
{
    Task<Result<PaginatedResponse<ProductCatalogView>>> GetProductsAsync(CancellationToken ct, PaginationParams paginationParams, ProductParams productParams);
    Task<Result<ProductDetailedResponse>> GetDetailedProductByIdAsync(uint id, CancellationToken ct);
}
