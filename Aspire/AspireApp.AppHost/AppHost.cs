var builder = DistributedApplication.CreateBuilder(args);

var sqlServer = builder.AddSqlServer("sqlServer").WithLifetime(ContainerLifetime.Persistent);

var userDatabase = sqlServer.AddDatabase("userDatabase");
var userService = builder.AddProject<Projects.MC_Profiles_API>("profilesService")
    .WaitFor(userDatabase)
    .WithReference(userDatabase, "UserDatabase");

var productDatabase = sqlServer.AddDatabase("productDatabase");
var productService = builder.AddProject<Projects.MC_Catalog_API>("catalogService")
    .WaitFor(productDatabase)
    .WithReference(productDatabase, "ProductDatabase");

var reactwebapp = builder.AddViteApp("MC-ReactWebApp", "./../../Clients/mc.market.reactwebapp", "dev");

var webStoreGateway = builder.AddProject<Projects.MC_Gateway>("marketCustomsGateway")
    .WithExternalHttpEndpoints()
    .WithReference(userService)
    .WithReference(productService)
    .WithReference(reactwebapp);

reactwebapp.WithReference(webStoreGateway);

builder.Build().Run();
