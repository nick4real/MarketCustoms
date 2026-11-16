using Microsoft.Extensions.Configuration;

namespace MC.Catalog.Infrastructure.Options;

public class MongoDbOptions
{
    [ConfigurationKeyName("CATALOGMONGODATABASE_URI")]
    public string Uri { get; set; } = null!;

    [ConfigurationKeyName("CATALOGMONGODATABASE_DATABASENAME")]
    public string DatabaseName { get; set; } = null!;

    [ConfigurationKeyName("CATALOGMONGODATABASE_DIRECTCONNECTION")]
    public bool DirectConnection { get; set; }

    [ConfigurationKeyName("CATALOGMONGODATABASE_LISTING_COLLECTION_NAME")]
    public string ListingCollectionName { get; set; } = "listingStorage";
}
