using Microsoft.EntityFrameworkCore;
using WebStoreProduct.Application.Interfaces.Repositories;
using WebStoreProduct.Application.Models;
using WebStoreProduct.Domain.Entities;
using WebStoreProduct.Domain.Views;

namespace WebStoreProduct.Infrastructure.Persistence.Repositories;

public class ProductRepository(AppDbContext dbContext) : IProductRepository
{
    public async Task<Product?> GetProductByIdAsync(uint id, CancellationToken ct)
        => await dbContext.Products.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<PagedList<ProductCatalogView>?> GetProductsCatalogViewAsync(int page, int size, CancellationToken ct, ProductParams? productParams = null)
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
            .Skip((page - 1) * size)
            .Take(size)
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
