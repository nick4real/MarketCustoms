using Microsoft.EntityFrameworkCore;
using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Models;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace MC.Catalog.Infrastructure.Persistence.Repositories;

public class ProductRepository(AppRelationalDbContext sqlContext, AppMongoDbContext mongoContext) : IProductRepository
{
    public async Task<Product?> GetProductByIdAsync(string id, CancellationToken ct)
    {
        var productBson = await mongoContext.Products.Find(p => p.Id == id).FirstOrDefaultAsync(ct);

        // Return detailed product information if found, otherwise return null
        if (productBson == null) return null;

        // Fetch the category from the relational database using the CategoryId from the product
        // TODO: Add CRUD categories 
        var category = await sqlContext.Categories.FindAsync(productBson.CategoryId, ct);
        //if (category == null) return null;

        return new Product
        {
            Id = productBson.Id,
            OwnerId = productBson.OwnerId,
            Title = productBson.Title,
            Description = productBson.Description,
            CategoryId = productBson.CategoryId,
            Category = category ?? new Category { Id = 0, Name = "Root"}, // TODO: Add CRUD categories
            CreatedAt = productBson.CreatedAt,
            Price = productBson.Price,
            StockQuantity = productBson.StockQuantity,
            ImageLinks = productBson.ImageLinks,
            Tags = productBson.Tags,
            Parameters = productBson.Parameters
        };
    }

    public async Task<PagedList<ProductCatalogView>?> GetProductsCatalogViewAsync(int skip, int take, CancellationToken ct, ProductParams? productParams)
    {
        // Start with an empty filter
        var filterBuilder = Builders<Models.ProductBson>.Filter;
        var filter = filterBuilder.Empty; 

        // Apply filtering based on ProductParams
        if (productParams != null && productParams.CategoryId.HasValue)
        {
            filter &= filterBuilder.Eq(p => p.CategoryId, productParams.CategoryId.Value);
        }

        // Fetching the products with pagination and projection to ProductCatalogView
        var products = await mongoContext.Products
            .Find(filter)
            .Skip(skip)
            .Limit(take)
            .Project(p => new ProductCatalogView(
                p.Id,
                p.Title,
                p.Description,
                p.Price,
                p.ImageLinks.FirstOrDefault() ?? string.Empty))
            .ToListAsync(ct);

        // If no products are found, return null
        if (products.Count == 0) return null;

        // Return the paged list of products along with the total count of them in the database
        return new PagedList<ProductCatalogView>(
            products.ToArray(),
            (int) await mongoContext.Products.CountDocumentsAsync(filter, cancellationToken: ct)
        );
    }

    public async Task AddProductAsync(Product product, CancellationToken ct)
    {
        var productBson = new Models.ProductBson
        {
            OwnerId = product.OwnerId,
            Title = product.Title,
            Description = product.Description,
            CategoryId = product.CategoryId,
            CreatedAt = product.CreatedAt,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            ImageLinks = product.ImageLinks,
            Tags = product.Tags,
            Parameters = product.Parameters
        };

        await mongoContext.Products.InsertOneAsync(productBson, cancellationToken: ct);
    }

    public async Task SaveChangesAsync()
    {
        await sqlContext.SaveChangesAsync();
    }
}
