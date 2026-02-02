using Microsoft.EntityFrameworkCore;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Interfaces.Repositories;
using WebStoreProduct.Application.Models;
using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Infrastructure.Persistence.Repositories;

public class ProductRepository(AppDbContext dbContext) : IProductRepository
{
    public async Task<Product?> GetProductByIdAsync(uint id)
        => await dbContext.Products.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<PaginatedList<ProductDto>?> GetProductsAsync(int page, int size, ProductParams? productParams = null)
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
            .Select(p => new ProductDto(
                p.Id,
                p.Title,
                p.Description,
                p.Price,
                p.Images.FirstOrDefault()))
            .ToArrayAsync();

        return new PaginatedList<ProductDto>(
            products,
            totalItems,
            page,
            size
        );
    }
}
