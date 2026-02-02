using MapsterMapper;
using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Interfaces.Repositories;
using WebStoreProduct.Application.Interfaces.Services;
using WebStoreProduct.Application.Responses;

namespace WebStoreProduct.Application.Services;

public class ProductService(IProductRepository productRepository, IMapper mapper) : IProductService
{
    public async Task<Result<ProductDetailedResponse>> GetDetailedProductByIdAsync(uint id, CancellationToken ct)
    {
        var product = await productRepository.GetProductByIdAsync(id, ct);
        if (product is null)
        {
            return Result<ProductDetailedResponse>.Failure(new Error(ErrorCode.NotFound, $"Product with ID {id} was not found."));
        }

        return Result<ProductDetailedResponse>.Success(mapper.Map<ProductDetailedResponse>(product));
    }

    public async Task<Result<PaginatedResponse<ProductDto>>> GetProductsAsync(int page, int size, CancellationToken ct, ProductParams? productParams = null)
    {
        var products = await productRepository.GetProductsAsync(page, size, ct, productParams);
        if (products is null)
        {
            return Result<PaginatedResponse<ProductDto>>.Failure(new Error(ErrorCode.NotFound, "No products were found."));
        }

        return Result<PaginatedResponse<ProductDto>>.Success(mapper.Map<PaginatedResponse<ProductDto>>(products));
    }
}
