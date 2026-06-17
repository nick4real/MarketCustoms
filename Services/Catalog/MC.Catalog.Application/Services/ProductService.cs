using MapsterMapper;
using MC.Catalog.Application.Common;
using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Models;
using MC.Catalog.Application.Responses;

namespace MC.Catalog.Application.Services;

public class ProductService(IProductRepository productRepository, IMapper mapper) : IProductService
{
    public async Task<Result<ProductDetailedResponse>> GetDetailedProductByIdAsync(string id, CancellationToken ct)
    {
        var product = await productRepository.GetProductByIdAsync(id, ct);
        if (product is null)
        {
            return Result<ProductDetailedResponse>.Failure(new Error(ErrorCode.NotFound, $"Product with ID {id} was not found."));
        }

        return Result<ProductDetailedResponse>.Success(mapper.Map<ProductDetailedResponse>(product));
    }

    public async Task<Result<PaginatedResponse<ProductCatalogViewDto>>> GetProductsAsync(CancellationToken ct, PaginationParams paginationParams, ProductParams productParams)
    {
        int skip = (paginationParams.PageIndex - 1) * paginationParams.PageSize;
        int take = paginationParams.PageSize;

        var pagedProducts = await productRepository.GetProductsCatalogViewAsync(skip, take, ct, productParams);
        if (pagedProducts is null)
        {
            return Result<PaginatedResponse<ProductCatalogViewDto>>.Failure(new Error(ErrorCode.NotFound, "No products were found."));
        }

        int totalPages = (int)Math.Ceiling(pagedProducts.TotalItems / (double)paginationParams.PageSize);
        bool hasPreviousPage = paginationParams.PageIndex > 1;
        bool hasNextPage = (paginationParams.PageIndex * paginationParams.PageSize) < pagedProducts.TotalItems;

        return Result<PaginatedResponse<ProductCatalogViewDto>>.Success(new PaginatedResponse<ProductCatalogViewDto>(
            mapper.Map<ProductCatalogViewDto[]>(pagedProducts.Items),
            paginationParams.PageSize,
            paginationParams.PageIndex,
            totalPages,
            hasPreviousPage,
            hasNextPage));
    }
}
