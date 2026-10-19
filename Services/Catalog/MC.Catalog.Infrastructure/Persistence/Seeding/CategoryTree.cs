using MC.Catalog.Domain.Entities;

namespace MC.Catalog.Infrastructure.Persistence.Seeding;

public static class CategoryTree
{
    public static List<Category> Create() =>
    [
        Node("Electronics",
            Node("Computers & Laptops",
                Node("Laptops")),
            Node("Audio & Headphones")),
        Node("Books",
            Node("Fiction"),
            Node("Computers & Technology",
                Node(".NET & C#"))),
        Node("Clothing",
            Node("Men's Apparel"),
            Node("Women's Apparel")),
        Node("Home & Kitchen",
            Node("Kitchen Appliances")),
        Node("Sports & Outdoors",
            Node("Camping & Hiking"))
    ];

    private static Category Node(string name, params Category[] children) => new()
    {
        Name = name,
        ChildCategories = children.Length > 0 ? [.. children] : null
    };
}
