internal static class IsolatedTestComposition
{
    private const string LocalTestIdentityEnvironment = "Authentication__UseLocalTestIdentity";

    public static void Configure(IDistributedApplicationBuilder builder, string testService)
    {
        switch (testService.Trim().ToLowerInvariant())
        {
            case "catalog":
                AddCatalog(builder);
                break;
            case "profiles":
                AddProfiles(builder);
                break;
            case "ordering":
                builder.AddProject<Projects.MC_Ordering_API>("orderingService")
                    .WithHttpHealthCheck("/health");
                break;
            case "notifications":
                builder.AddProject<Projects.MC_Notifications_API>("notificationsService")
                    .WithHttpHealthCheck("/health");
                break;
            default:
                throw new InvalidOperationException(
                    $"Unknown MarketCustoms:TestService '{testService}'. Expected catalog, profiles, ordering, or notifications.");
        }
    }

    private static void AddCatalog(IDistributedApplicationBuilder builder)
    {
        var sqlServer = builder.AddSqlServer("sqlServer")
            .WithLifetime(ContainerLifetime.Session);
        var mongoServer = builder.AddMongoDB("mongoServer")
            .WithLifetime(ContainerLifetime.Session);

        var catalogSqlDatabase = sqlServer.AddDatabase("catalogSqlDatabase");
        var catalogMongoDatabase = mongoServer.AddDatabase("catalogMongoDatabase");

        builder.AddProject<Projects.MC_Catalog_API>("catalogService")
            .WaitFor(catalogSqlDatabase)
            .WaitFor(catalogMongoDatabase)
            .WithReference(catalogSqlDatabase, "catalogSqlDatabase")
            .WithReference(catalogMongoDatabase, "catalogMongoDatabase")
            .WithEnvironment(LocalTestIdentityEnvironment, "true")
            .WithHttpHealthCheck("/health");
    }

    private static void AddProfiles(IDistributedApplicationBuilder builder)
    {
        var sqlServer = builder.AddSqlServer("sqlServer")
            .WithLifetime(ContainerLifetime.Session);
        var profilesSqlDatabase = sqlServer.AddDatabase("profilesSqlDatabase");

        builder.AddProject<Projects.MC_Profiles_API>("profilesService")
            .WaitFor(profilesSqlDatabase)
            .WithReference(profilesSqlDatabase, "profilesSqlDatabase")
            .WithEnvironment(LocalTestIdentityEnvironment, "true")
            .WithHttpHealthCheck("/health");
    }
}
