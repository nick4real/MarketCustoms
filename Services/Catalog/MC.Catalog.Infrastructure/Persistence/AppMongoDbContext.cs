using MC.Catalog.Infrastructure.Models;
using MC.Catalog.Infrastructure.Options;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace MC.Catalog.Infrastructure.Persistence;

public class AppMongoDbContext
{
    private readonly IMongoClient _mongoClient;
    private readonly IMongoDatabase _mongoDatabase;
    private readonly IMongoCollection<ListingBson> _listings;
    public IMongoCollection<ListingBson> Listings => _listings;
    public async Task<IClientSessionHandle> GetClientSessionAsync(CancellationToken ct)
        => await _mongoClient.StartSessionAsync(cancellationToken: ct);

    public AppMongoDbContext(IOptions<MongoDbOptions> options)
    {
        var mongoOptions = options.Value;

        _mongoClient = new MongoClient(mongoOptions.Uri);
        _mongoDatabase = _mongoClient.GetDatabase(mongoOptions.DatabaseName);
        _listings = _mongoDatabase.GetCollection<ListingBson>(mongoOptions.ListingCollectionName);
    }
}
