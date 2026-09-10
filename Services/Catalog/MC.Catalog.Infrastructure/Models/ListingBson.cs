using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MC.Catalog.Infrastructure.Models;

public class ListingBson
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;
    // [BsonGuidRepresentation(GuidRepresentation.Standard)]
    public Guid OwnerGuid { get; set; } = Guid.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public uint CategoryId { get; set; }
    public uint LocationId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public List<string> ImageLinks { get; set; } = [];
    public List<string> Tags { get; set; } = [];
    public List<Tuple<string, string>> Parameters { get; set; } = [];
}
