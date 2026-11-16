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

        // Opt-in: needed when the server advertises an address the client cannot reach (local replica set container).
        var settings = MongoClientSettings.FromConnectionString(mongoOptions.Uri);
        if (mongoOptions.DirectConnection) settings.DirectConnection = true;
        _mongoClient = new MongoClient(settings);
        _mongoDatabase = _mongoClient.GetDatabase(mongoOptions.DatabaseName);
        _listings = _mongoDatabase.GetCollection<ListingBson>(mongoOptions.ListingCollectionName);
    }
}
