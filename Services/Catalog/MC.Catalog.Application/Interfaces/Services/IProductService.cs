using MC.Catalog.Application.Common;
using MC.Catalog.Application.DTOs;
using MC.Catalog.Application.Models;
using MC.Catalog.Application.Responses;

namespace MC.Catalog.Application.Interfaces.Services;

public interface IProductService
{
    Task<Result<PaginatedResponse<ProductCatalogViewDto>>> GetProductsAsync(CancellationToken ct, PaginationParams paginationParams, ProductParams productParams);
    Task<Result<ProductDetailedResponse>> GetDetailedProductByIdAsync(uint id, CancellationToken ct);
}
