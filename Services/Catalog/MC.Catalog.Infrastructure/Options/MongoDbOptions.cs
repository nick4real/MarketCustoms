using Microsoft.Extensions.Configuration;

namespace MC.Catalog.Infrastructure.Options;

public class MongoDbOptions
{
    [ConfigurationKeyName("CATALOGMONGODATABASE_URI")]
    public string Uri { get; set; } = null!;

    [ConfigurationKeyName("CATALOGMONGODATABASE_DATABASENAME")]
    public string DatabaseName { get; set; } = null!;

    [ConfigurationKeyName("CATALOGMONGODATABASE_PRODUCT_COLLECTION_NAME")]
    public string ProductCollectionName { get; set; } = "productStorage";
}
