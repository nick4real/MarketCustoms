using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Responses;

namespace WebStoreProduct.Application.Interfaces.Services;

public interface IProductService
{
    Task<Result<PaginatedResponse<ProductDto>>> GetProductsAsync(int page, int size, CancellationToken ct, ProductParams productParams);
    Task<Result<ProductDetailedResponse>> GetDetailedProductByIdAsync(uint id, CancellationToken ct);
}
