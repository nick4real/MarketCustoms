using Microsoft.EntityFrameworkCore;
using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Models;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;

namespace MC.Catalog.Infrastructure.Persistence.Repositories;

public class ProductRepository(AppDbContext dbContext) : IProductRepository
{
    public async Task<Product?> GetProductByIdAsync(uint id, CancellationToken ct)
        => await dbContext.Products.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<PagedList<ProductCatalogView>?> GetProductsCatalogViewAsync(int skip, int take, CancellationToken ct, ProductParams? productParams = null)
    {
        var query = dbContext.Products.AsNoTracking();

        if (productParams != null)
        {
            if (productParams.CategoryId > 0) query = query.Where(p => p.CategoryId == productParams.CategoryId);
        }

        var totalItems = await query.CountAsync();
        if (totalItems == 0) return null;

        var products = await query
            .Include(p => p.Images)
            .Skip(skip)
            .Take(take)
            .Select(p => new ProductCatalogView(
                p.Id,
                p.Title,
                p.Description,
                p.Price,
                p.Images.FirstOrDefault()))
            .ToArrayAsync();

        return new PagedList<ProductCatalogView>(
            products,
            totalItems
        );
    }
}
