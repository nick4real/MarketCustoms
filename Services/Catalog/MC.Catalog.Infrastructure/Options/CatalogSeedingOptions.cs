namespace MC.Catalog.Infrastructure.Options;

public class CatalogSeedingOptions
{
    public const string SectionName = "Seeding:Catalog";
    public const int MaxListingsPerSeller = 1_000;

    public int ListingsPerSeller { get; set; } = 10;
    public bool IncludeCurated { get; set; } = true;
}
