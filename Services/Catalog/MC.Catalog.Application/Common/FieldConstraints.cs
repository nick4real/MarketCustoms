namespace MC.Catalog.Application.Common;

public static class FieldConstraints
{
    // Pagination
    public const int MinPageSize = 1;
    public const int MaxPageSize = 48;

    // MongoDB
    public const int MongoDbKeySize = 24;
}
