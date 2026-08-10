namespace MC.Catalog.Domain.Entities;

public class Product
{
    public string Id { get; set; } = string.Empty;
    public string OwnerId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public uint CategoryId { get; set; }
    public Category Category { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public List<string> ImageLinks { get; set; }
    public List<string> Tags { get; set; }
    public List<Tuple<string, string>> Parameters { get; set; }
}