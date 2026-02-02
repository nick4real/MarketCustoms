using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Models;
using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<PaginatedList<ProductDto>?> GetProductsAsync(int page, int size);
    Task<PaginatedList<ProductDto>?> GetProductsByCategoryAsync(uint categoryId, int page, int size);
    Task<Product?> GetProductByIdAsync(uint id);
}
