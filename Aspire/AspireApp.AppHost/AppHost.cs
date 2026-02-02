var builder = DistributedApplication.CreateBuilder(args);

var sqlServer = builder.AddSqlServer("sqlServer").WithLifetime(ContainerLifetime.Persistent);

var userDatabase = sqlServer.AddDatabase("userDatabase");
var userService = builder.AddProject<Projects.WebStoreUser_API>("userService")
    .WaitFor(userDatabase)
    .WithReference(userDatabase, "UserDatabase");

var productDatabase = sqlServer.AddDatabase("productDatabase");
var productService = builder.AddProject<Projects.WebStoreProduct_API>("productService")
    .WaitFor(productDatabase)
    .WithReference(productDatabase, "ProductDatabase");

var blazorWebApp = builder.AddProject<Projects.BlazorApp>("blazorWebApp");

var webStoreGateway = builder.AddProject<Projects.WebStoreGateway>("webStoreGateway")
    .WithReference(userService)
    .WithReference(productService)
    .WithReference(blazorWebApp);

builder.Build().Run();
