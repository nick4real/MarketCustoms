namespace MC.Profiles.Infrastructure.Options;

public class ProfilesSeedingOptions
{
    public const string SectionName = "Seeding:Profiles";

    public DevUserSeedingOptions DevUser { get; set; } = new();
}

/// <summary>
/// Maps a real identity (Auth0 <c>sub</c> or local test user id) onto seller 0.
/// </summary>
public class DevUserSeedingOptions
{
    public string? ExternalUserId { get; set; }
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
}
