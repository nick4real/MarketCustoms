using MC.Catalog.Infrastructure.Models;
using MC.Catalog.Infrastructure.Options;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace MC.Catalog.Infrastructure.Persistence;

public class AppMongoDbContext
{
    private readonly IMongoClient _mongoClient;
    private readonly IMongoDatabase _mongoDatabase;
    private readonly IMongoCollection<ProductBson> _products;
    public IMongoCollection<ProductBson> Products => _products;

    public AppMongoDbContext(IOptions<MongoDbOptions> options)
    {
        var mongoOptions = options.Value;

        _mongoClient = new MongoClient(mongoOptions.Uri);
        _mongoDatabase = _mongoClient.GetDatabase(mongoOptions.DatabaseName);
        _products = _mongoDatabase.GetCollection<ProductBson>(mongoOptions.ProductCollectionName);
    }
}
