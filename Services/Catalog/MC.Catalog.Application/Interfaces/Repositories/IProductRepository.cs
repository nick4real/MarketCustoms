using WebStoreProduct.Application.Models;
using WebStoreProduct.Domain.Entities;
using WebStoreProduct.Domain.Views;

namespace WebStoreProduct.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<PagedList<ProductCatalogView>?> GetProductsCatalogViewAsync(int skip, int take, CancellationToken ct, ProductParams queryParams);
    Task<Product?> GetProductByIdAsync(uint id, CancellationToken ct);
}
