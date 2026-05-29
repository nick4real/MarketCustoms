namespace WebStoreProduct.Domain.Entities;

public class Product
{
    public uint Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public uint CategoryId { get; set; }
    public Category Category { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public List<ImageLink> Images { get; set; } = new();
}