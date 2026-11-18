namespace MC.Catalog.Application.Common;

public static class Permissions
{
    public const string ListingsWrite = "listings:write";
    public const string ListingsModerate = "listings:moderate";
    public const string CategoriesWrite = "categories:write";

    public static readonly string[] All = [ListingsWrite, ListingsModerate, CategoriesWrite];
}
