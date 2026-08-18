using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Models;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;

namespace MC.Catalog.UnitTests.Fakes;

internal sealed class FakeProductRepository : IProductRepository
{
    private readonly List<Product> _products = [];

    public Task<PagedList<ProductCatalogView>> GetProductsCatalogViewAsync(
        int skip,
        int take,
        CancellationToken ct,
        ProductParams? queryParams)
    {
        var views = _products
            .Skip(skip)
            .Take(take)
            .Select(product => new ProductCatalogView(
                product.Id,
                product.Title,
                product.Description,
                product.Price,
                product.ImageLinks.FirstOrDefault() ?? string.Empty))
            .ToArray();

        return Task.FromResult(new PagedList<ProductCatalogView>(views, _products.Count));
    }

    public Task<Product?> GetProductByIdAsync(string id, CancellationToken ct)
        => Task.FromResult(_products.FirstOrDefault(product => product.Id == id));

    public Task AddProductAsync(Product product, CancellationToken ct)
    {
        _products.Add(product);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync() => Task.CompletedTask;
}
