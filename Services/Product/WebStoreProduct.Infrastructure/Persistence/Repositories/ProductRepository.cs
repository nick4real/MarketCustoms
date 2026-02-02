using Mapster;
using Microsoft.EntityFrameworkCore;
using WebStoreProduct.Application.DTOs;
using WebStoreProduct.Application.Interfaces.Repositories;
using WebStoreProduct.Application.Models;
using WebStoreProduct.Domain.Entities;

namespace WebStoreProduct.Infrastructure.Persistence.Repositories;

public class ProductRepository(AppDbContext dbContext) : IProductRepository
{
    public async Task<Product?> GetProductByIdAsync(uint id)
        => await dbContext.Products.FirstOrDefaultAsync(p => p.Id == id);

    public async Task<PaginatedList<ProductDto>?> GetProductsAsync(int page, int size)
    {
        var products = await dbContext.Products
            .Include(p => p.Images)
            .Skip((page - 1) * size)
            .Take(size)
            .ProjectToType<ProductDto>()
            .ToArrayAsync();

        var list = products.ToList();

        var totalPages = (int)Math.Ceiling(await dbContext.Products.CountAsync() / (double)size);

        return new PaginatedList<ProductDto>(
            products,
            page,
            totalPages
        );
    }

    public async Task<PaginatedList<ProductDto>?> GetProductsByCategoryAsync(uint categoryId, int page, int size)
    {
        var products = await dbContext.Products
            .Where(p => p.CategoryId == categoryId)
            .ProjectToType<ProductDto>()
            .Skip((page - 1) * size)
            .Take(size)
            .ToArrayAsync();

        var totalPages = (int)Math.Ceiling(await dbContext.Products.Where(p => p.CategoryId == categoryId).CountAsync() / (double)size);

        return new PaginatedList<ProductDto>(
            products,
            page,
            totalPages
        );
    }
}
