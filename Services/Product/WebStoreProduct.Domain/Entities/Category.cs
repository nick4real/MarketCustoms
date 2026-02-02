namespace WebStoreProduct.Domain.Entities;

public class Category
{
    public uint Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public uint? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public List<Category> ChildCategories { get; set; }
}
