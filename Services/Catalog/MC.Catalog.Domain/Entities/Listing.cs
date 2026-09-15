namespace MC.Catalog.Domain.Entities;

public class Listing
{
    public string Id { get; set; } = string.Empty;
    public Guid OwnerGuid { get; set; } = Guid.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public uint CategoryId { get; set; }
    public Category Category { get; set; } = new();
    public uint LocationId { get; set; }
    public Location Location { get; set; } = new();
    public DateTimeOffset CreatedAt { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public List<string> ImageLinks { get; set; } = [];
    public List<string> Tags { get; set; } = [];
    public List<Tuple<string, string>> Parameters { get; set; } = [];
}
