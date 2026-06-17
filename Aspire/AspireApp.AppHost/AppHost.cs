var builder = DistributedApplication.CreateBuilder(args);

// Servers
var sqlServer = builder.AddSqlServer("sqlServer")
    .WithLifetime(ContainerLifetime.Persistent);

// TODO: Refactor to Profiles Service
var userDatabase = sqlServer.AddDatabase("userDatabase");
var userService = builder.AddProject<Projects.MC_Profiles_API>("profilesService")
    .WaitFor(userDatabase)
    .WithReference(userDatabase, "UserDatabase");

// Catalog Service
var productDatabase = sqlServer.AddDatabase("catalogDatabase");
var productService = builder.AddProject<Projects.MC_Catalog_API>("catalogService")
    .WaitFor(productDatabase)
    .WithReference(productDatabase, "CatalogDatabase");

// React Web App
var reactwebapp = builder.AddViteApp("reactWebApp", "./../../Clients/mc.market.reactwebapp", "dev");

// Gateway
var webStoreGateway = builder.AddProject<Projects.MC_Gateway>("marketCustomsGateway")
    .WithExternalHttpEndpoints()
    .WithReference(userService)
    .WithReference(productService)
    .WithReference(reactwebapp);

reactwebapp.WithReference(webStoreGateway);

builder.Build().Run();
