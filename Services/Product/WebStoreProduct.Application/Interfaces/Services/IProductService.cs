using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Responses;
using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Application.Interfaces.Services;

public interface IProductService
{
    Task<Result<PaginatedResponse<ProductDto>>> GetProductsAsync(int page, int size);
    Task<Result<PaginatedResponse<ProductDto>>> GetProductsByCategoryAsync(uint categoryId, int page, int size);
    Task<Result<Product>> GetDetailedProductByIdAsync(uint id);
}
