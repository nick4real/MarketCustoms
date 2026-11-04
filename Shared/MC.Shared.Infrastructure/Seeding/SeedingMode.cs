namespace MC.Shared.Infrastructure.Seeding;

public enum SeedingMode
{
    /// <summary>Ensure the schema exists; never insert data.</summary>
    None,

    /// <summary>Ensure the schema exists; insert data only when the store is empty.</summary>
    IfEmpty,

    /// <summary>Drop and recreate the store, then insert data.</summary>
    Reset
}
