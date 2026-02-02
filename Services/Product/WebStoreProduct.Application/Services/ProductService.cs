using MapsterMapper;
using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Interfaces.Repositories;
using WebStoreProduct.Application.Interfaces.Services;
using WebStoreProduct.Application.Responses;
using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Application.Services;

public class ProductService(IProductRepository productRepository, IMapper mapper) : IProductService
{
    public async Task<Result<Product>> GetDetailedProductByIdAsync(uint id)
    {
        var product = await productRepository.GetProductByIdAsync(id);
        if (product is null)
        {
            return Result<Product>.Failure(new Error(ErrorCode.NotFound, $"Product with ID {id} was not found."));
        }

        return Result<Product>.Success(product);
    }

    public async Task<Result<PaginatedResponse<ProductDto>>> GetProductsAsync(int page, int size)
    {
        var products = await productRepository.GetProductsAsync(page, size);
        if (products is null)
        {
            return Result<PaginatedResponse<ProductDto>>.Failure(new Error(ErrorCode.NotFound, "No products were found."));
        }

        return Result<PaginatedResponse<ProductDto>>.Success(mapper.Map<PaginatedResponse<ProductDto>>(products));
    }

    public async Task<Result<PaginatedResponse<ProductDto>>> GetProductsByCategoryAsync(uint categoryId, int page, int size)
    {
        var products = await productRepository.GetProductsByCategoryAsync(categoryId, page, size);
        if (products is null)
        {
            return Result<PaginatedResponse<ProductDto>>.Failure(new Error(ErrorCode.NotFound, "No products were found."));
        }

        return Result<PaginatedResponse<ProductDto>>.Success(mapper.Map<PaginatedResponse<ProductDto>>(products));
    }
}
