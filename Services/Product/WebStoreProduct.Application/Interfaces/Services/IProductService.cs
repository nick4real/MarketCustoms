using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Responses;
using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Application.Interfaces.Services;

public interface IProductService
{
    Task<Result<PaginatedResponse<ProductDto>>> GetProductsAsync(int page, int size, ProductParams productParams);
    Task<Result<Product>> GetDetailedProductByIdAsync(uint id);
}
