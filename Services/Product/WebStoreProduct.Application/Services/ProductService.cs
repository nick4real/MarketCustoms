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
    public async Task<Result<ProductDetailedResponse>> GetDetailedProductByIdAsync(uint id)
    {
        var product = await productRepository.GetProductByIdAsync(id);
        if (product is null)
        {
            return Result<ProductDetailedResponse>.Failure(new Error(ErrorCode.NotFound, $"Product with ID {id} was not found."));
        }

        return Result<ProductDetailedResponse>.Success(mapper.Map<ProductDetailedResponse>(product));
    }

    public async Task<Result<PaginatedResponse<ProductDto>>> GetProductsAsync(int page, int size, ProductParams? productParams = null)
    {
        var products = await productRepository.GetProductsAsync(page, size, productParams);
        if (products is null)
        {
            return Result<PaginatedResponse<ProductDto>>.Failure(new Error(ErrorCode.NotFound, "No products were found."));
        }

        return Result<PaginatedResponse<ProductDto>>.Success(mapper.Map<PaginatedResponse<ProductDto>>(products));
    }
}
