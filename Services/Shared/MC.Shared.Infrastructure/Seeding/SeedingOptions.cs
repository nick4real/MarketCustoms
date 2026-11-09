namespace MC.Shared.Infrastructure.Seeding;

public sealed class SeedingOptions
{
    public const string SectionName = "Seeding";
    public const int MaxPopulation = 100_000;

    public SeedingMode Mode { get; set; } = SeedingMode.None;
    public int RandomSeed { get; set; } = 1337;
    public PopulationSeedingOptions Population { get; set; } = new();
}

/// <summary>
/// Size of the seeded user population. Every service reads the same values so that
/// cross-service references built with <see cref="SeedIds"/> point at existing profiles.
/// </summary>
public sealed class PopulationSeedingOptions
{
    public int Sellers { get; set; } = 10;
    public int Buyers { get; set; } = 25;
}
