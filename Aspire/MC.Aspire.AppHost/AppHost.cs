var builder = DistributedApplication.CreateBuilder(args);

var testService = builder.Configuration["MarketCustoms:TestService"];
if (!string.IsNullOrWhiteSpace(testService))
{
    IsolatedTestComposition.Configure(builder, testService);
}
else
{
    AddDeveloperGraph(builder);
}

builder.Build().Run();

static void AddDeveloperGraph(IDistributedApplicationBuilder builder)
{
    // Servers
    var sqlServer = builder.AddSqlServer("sqlServer")
        .WithContainerName("MC.SqlServer")
        .WithLifetime(ContainerLifetime.Persistent);

    var mongoServer = builder.AddMongoDB("mongoServer")
        .WithContainerName("MC.MongoDB")
        .WithLifetime(ContainerLifetime.Persistent)
        .WithMongoExpress(o =>
        {
            o.WithContainerName("MC.MongoExpress");
            o.WithLifetime(ContainerLifetime.Persistent);
        });

    // Profiles Service
    var profilesSqlDatabaseName = "profilesSqlDatabase";
    var profilesSqlDatabase = sqlServer.AddDatabase(profilesSqlDatabaseName);
    var profilesService = builder.AddProject<Projects.MC_Profiles_API>("profilesService")
        .WaitFor(profilesSqlDatabase)
        .WithReference(profilesSqlDatabase, profilesSqlDatabaseName);

    // Catalog Service
    var catalogSqlDatabaseName = "catalogSqlDatabase";
    var catalogMongoDatabaseName = "catalogMongoDatabase";
    var catalogSqlDatabase = sqlServer.AddDatabase(catalogSqlDatabaseName);
    var catalogMongoDatabase = mongoServer.AddDatabase(catalogMongoDatabaseName);
    var catalogService = builder.AddProject<Projects.MC_Catalog_API>("catalogService")
        .WaitFor(catalogSqlDatabase)
        .WaitFor(catalogMongoDatabase)
        .WithReference(catalogSqlDatabase, catalogSqlDatabaseName)
        .WithReference(catalogMongoDatabase, catalogMongoDatabaseName);

    // React Web App
    var reactwebapp = builder.AddViteApp("reactWebApp", "./../../Clients/MC.Market.WebApp", "dev");

    // Gateway
    var webStoreGateway = builder.AddProject<Projects.MC_Gateway>("marketCustomsGateway")
        .WithExternalHttpEndpoints()
        .WithReference(profilesService)
        .WithReference(catalogService)
        .WithReference(reactwebapp);

    reactwebapp.WithReference(webStoreGateway);
}
