using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Interfaces.Services;
using MC.Catalog.Application.Models;
using MC.Catalog.Application.Requests;
using MC.Catalog.Application.Responses;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;
using MC.Shared.Application.Common;

namespace MC.Catalog.Application.Services;

public class ProductService(IProductRepository productRepository) : IProductService
{
    public async Task<Result<ProductDetailedResponse>> GetDetailedProductByIdAsync(string id, CancellationToken ct)
    {
        if (id.Length != 24)
        {
            return Result<ProductDetailedResponse>.Failure(new Error(ErrorCode.ValidationFailed, "Invalid product ID format."));
        }

        var product = await productRepository.GetProductByIdAsync(id, ct);
        if (product is null)
        {
            return Result<ProductDetailedResponse>.Failure(new Error(ErrorCode.NotFound, $"Product with ID {id} was not found."));
        }

        return Result<ProductDetailedResponse>.Success(MapProductDetailedResponse(product));
    }

    public async Task<Result<PaginatedResponse<ProductCatalogViewDto>>> GetProductsAsync(CancellationToken ct, PaginationParams paginationParams, ProductParams? productParams)
    {
        int skip = (paginationParams.PageIndex - 1) * paginationParams.PageSize;
        int take = paginationParams.PageSize;

        var pagedProducts = await productRepository.GetProductsCatalogViewAsync(skip, take, ct, productParams);
        int totalPages = pagedProducts.TotalItems == 0
            ? 0
            : (int)Math.Ceiling(pagedProducts.TotalItems / (double)paginationParams.PageSize);
        bool hasPreviousPage = paginationParams.PageIndex > 1;
        bool hasNextPage = (paginationParams.PageIndex * paginationParams.PageSize) < pagedProducts.TotalItems;

        return Result<PaginatedResponse<ProductCatalogViewDto>>.Success(new PaginatedResponse<ProductCatalogViewDto>(
            pagedProducts.Items.Select(MapCatalogView).ToArray(),
            paginationParams.PageSize,
            paginationParams.PageIndex,
            totalPages,
            hasPreviousPage,
            hasNextPage));
    }

    public async Task<Result<ProductDetailedResponse>> CreateProductAsync(CreateProductRequest request, CancellationToken ct)
    {
        try
        {
            var product = new Product
            {
                OwnerId = request.OwnerId,
                Title = request.Title,
                Description = request.Description,
                CategoryId = request.CategoryId,
                Category = new Category { Id = request.CategoryId, Name = string.Empty },
                Price = request.Price,
                StockQuantity = request.StockQuantity,
                ImageLinks = request.ImageLinks ?? [],
                Tags = request.Tags ?? [],
                Parameters = request.Parameters ?? [],
                CreatedAt = DateTimeOffset.UtcNow
            };
            await productRepository.AddProductAsync(product, ct);
            return Result<ProductDetailedResponse>.Success(MapProductDetailedResponse(product));
        }
        catch
        {
            return Result<ProductDetailedResponse>.Failure(new Error(ErrorCode.InternalServerError, "An error occurred while creating the product."));
        }
    }

    private static ProductCatalogViewDto MapCatalogView(ProductCatalogView view)
        => new(
            view.Id,
            view.Title,
            view.Description,
            view.Price,
            view.ImageLink);

    private static ProductDetailedResponse MapProductDetailedResponse(Product product)
        => new(
            product.Id,
            product.Title,
            product.Description,
            product.CategoryId,
            product.Category,
            product.CreatedAt.UtcDateTime,
            product.Price,
            product.StockQuantity,
            product.ImageLinks ?? [],
            product.Tags ?? [],
            product.Parameters.Select(parameter => new ProductParameterDto(parameter.Item1, parameter.Item2)).ToList());
}
