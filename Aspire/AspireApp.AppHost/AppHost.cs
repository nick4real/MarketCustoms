var builder = DistributedApplication.CreateBuilder(args);

// Servers
var sqlServer = builder.AddSqlServer("sqlServer")
    .WithLifetime(ContainerLifetime.Persistent);

var mongoServer = builder.AddMongoDB("mongoServer")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithMongoExpress(o =>
    {
        o.WithContainerName("MongoExpress");
        o.WithLifetime(ContainerLifetime.Persistent);
    });

// Profiles Service
var profilesSqlDatabase = sqlServer.AddDatabase("profilesSqlDatabase");
var profilesService = builder.AddProject<Projects.MC_Profiles_API>("profilesService")
    .WaitFor(profilesSqlDatabase)
    .WithReference(profilesSqlDatabase, "ProfilesSqlDatabase");

// Catalog Service
var mongoDatabaseName = "catalogMongoDatabase";
var sqlDatabaseName = "catalogSqlDatabase";
var catalogSqlDatabase = sqlServer.AddDatabase(sqlDatabaseName);
var catalogMongoDatabase = mongoServer.AddDatabase(mongoDatabaseName);
var catalogService = builder.AddProject<Projects.MC_Catalog_API>("catalogService")
    .WaitFor(catalogSqlDatabase)
    .WaitFor(catalogMongoDatabase)
    .WithReference(catalogSqlDatabase, sqlDatabaseName)
    .WithReference(catalogMongoDatabase, mongoDatabaseName);

// React Web App
var reactwebapp = builder.AddViteApp("reactWebApp", "./../../Clients/mc.market.reactwebapp", "dev");

// Gateway
var webStoreGateway = builder.AddProject<Projects.MC_Gateway>("marketCustomsGateway")
    .WithExternalHttpEndpoints()
    .WithReference(profilesService)
    .WithReference(catalogService)
    .WithReference(reactwebapp);

reactwebapp.WithReference(webStoreGateway);

builder.Build().Run();
