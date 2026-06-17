using MC.Catalog.Application.Models;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;

namespace MC.Catalog.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<PagedList<ProductCatalogView>?> GetProductsCatalogViewAsync(int skip, int take, CancellationToken ct, ProductParams queryParams);
    Task<Product?> GetProductByIdAsync(string id, CancellationToken ct);
}
