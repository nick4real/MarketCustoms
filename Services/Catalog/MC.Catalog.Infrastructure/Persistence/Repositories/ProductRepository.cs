using MC.Catalog.Application.Interfaces.Repositories;
using MC.Catalog.Application.Models;
using MC.Catalog.Domain.Entities;
using MC.Catalog.Domain.Views;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using System.Text.RegularExpressions;

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

        return new Product
        {
            Id = productBson.Id,
            OwnerId = productBson.OwnerId,
            Title = productBson.Title,
            Description = productBson.Description,
            CategoryId = productBson.CategoryId,
            Category = category ?? new Category { Id = 0, Name = "Unknown" }, // TODO: Add CRUD categories
            CreatedAt = productBson.CreatedAt,
            Price = productBson.Price,
            StockQuantity = productBson.StockQuantity,
            ImageLinks = productBson.ImageLinks ?? [],
            Tags = productBson.Tags ?? [],
            Parameters = productBson.Parameters ?? []
        };
    }

    public async Task<PagedList<ProductCatalogView>> GetProductsCatalogViewAsync(int skip, int take, CancellationToken ct, ProductParams? productParams)
    {
        var filterBuilder = Builders<Models.ProductBson>.Filter;
        var filter = filterBuilder.Empty;

        Console.WriteLine(filter == filterBuilder.Empty);

        if (productParams != null && productParams.CategoryId.HasValue)
        {
            filter &= filterBuilder.Eq(p => p.CategoryId, productParams.CategoryId.Value);
        }

        if (productParams != null && !string.IsNullOrWhiteSpace(productParams.Title))
        {
            var title = Regex.Escape(productParams.Title.Trim());
            filter &= filterBuilder.Regex(p => p.Title, new MongoDB.Bson.BsonRegularExpression(title, "i"));
        }

        if (productParams?.Parameters is { Count: > 0 })
        {
            foreach (var parameter in productParams.Parameters)
            {
                var name = Regex.Escape(parameter.Name.Trim());
                var value = Regex.Escape(parameter.Value.Trim());
                filter &= filterBuilder.ElemMatch(
                    p => p.Parameters,
                    Builders<Tuple<string, string>>.Filter.Regex(x => x.Item1, new MongoDB.Bson.BsonRegularExpression($"^{name}$", "i"))
                    & Builders<Tuple<string, string>>.Filter.Regex(x => x.Item2, new MongoDB.Bson.BsonRegularExpression($"^{value}$", "i")));
            }
        }

        var totalItemsTask = filter == filterBuilder.Empty
            ? mongoContext.Products.EstimatedDocumentCountAsync(cancellationToken: ct)
            : mongoContext.Products.CountDocumentsAsync(filter, cancellationToken: ct);

        var productsTask = mongoContext.Products
            .Find(filter)
            .SortByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Limit(take)
            .Project(p => new ProductCatalogView(
                p.Id,
                p.Title,
                p.Description,
                p.Price,
                p.ImageLinks.FirstOrDefault() ?? string.Empty
            ))
            .ToListAsync(ct);

        await Task.WhenAll(productsTask, totalItemsTask);

        return new PagedList<ProductCatalogView>(
            productsTask.Result.ToArray(),
            (int)totalItemsTask.Result
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
            ImageLinks = product.ImageLinks ?? [],
            Tags = product.Tags ?? [],
            Parameters = product.Parameters ?? []
        };

        await mongoContext.Products.InsertOneAsync(productBson, cancellationToken: ct);
    }

    public async Task SaveChangesAsync()
    {
        await sqlContext.SaveChangesAsync();
    }
}
