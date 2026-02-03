using MapsterMapper;
using WebStoreProduct.Application.Common;
using WebStoreProduct.Application.Interfaces.Repositories;
using WebStoreProduct.Application.Interfaces.Services;
using WebStoreProduct.Application.Models;
using WebStoreProduct.Application.Responses;
using WebStoreProduct.Domain.Views;

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

    public async Task<Result<PaginatedResponse<ProductCatalogView>>> GetProductsAsync(CancellationToken ct, PaginationParams paginationParams, ProductParams productParams)
    {
        int skip = (paginationParams.PageIndex - 1) * paginationParams.PageSize;
        int take = paginationParams.PageSize;

        var pagedProducts = await productRepository.GetProductsCatalogViewAsync(skip, take, ct, productParams);
        if (pagedProducts is null)
        {
            return Result<PaginatedResponse<ProductCatalogView>>.Failure(new Error(ErrorCode.NotFound, "No products were found."));
        }

        int totalPages = (int)Math.Ceiling(pagedProducts.TotalItems / (double)paginationParams.PageSize);
        bool hasPreviousPage = paginationParams.PageIndex > 1;
        bool hasNextPage = (paginationParams.PageIndex * paginationParams.PageSize) < pagedProducts.TotalItems;

        return Result<PaginatedResponse<ProductCatalogView>>.Success(new PaginatedResponse<ProductCatalogView>(
            pagedProducts.Items,
            paginationParams.PageSize,
            paginationParams.PageIndex,
            totalPages,
            hasPreviousPage,
            hasNextPage));
    }
}
