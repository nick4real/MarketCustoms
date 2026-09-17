using MC.Aspire.AppHost;
using MC.Aspire.AppHost.Parameters;

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
    var auth0Domain = builder.AddParameter("Auth0-Domain", true);
    var auth0Audience = builder.AddParameter("Auth0-Audience", true);
    var auth0BackendClientId = builder.AddParameter("Auth0-BackendM2M-ClientId", true);
    var auth0BackendClientSecret = builder.AddParameter("Auth0-BackendM2M-ClientSecret", true);
    var auth0FrontendClientId = builder.AddParameter("Auth0-Frontend-ClientId", true);

    var auth0Parameters = new Auth0Parameters(auth0Domain, auth0Audience);
    var auth0ManagementParameters = new Auth0ManagementParameters(auth0BackendClientId, auth0BackendClientSecret);
    var auth0WebAppParameters = new Auth0WebAppParameters(auth0Domain, auth0Audience, auth0FrontendClientId);

    // Servers
    var sqlServer = builder.AddSqlServer("sqlServer")
        .WithContainerName("MC.SqlServer")
        .WithHostPort(14333)
        .WithDataVolume("MC.SqlServer.DataVolume")
        .WithLifetime(ContainerLifetime.Persistent);

    var mongoServer = builder.AddMongoDB("mongoServer")
        .WithContainerName("MC.MongoDB")
        .WithLifetime(ContainerLifetime.Persistent)
        .WithDataVolume("MC.MongoDB.DataVolume")
        .WithMongoExpress(o =>
        {
            o.WithContainerName("MC.MongoExpress");
            o.WithLifetime(ContainerLifetime.Persistent);
        });

    // Profiles Service
    var profilesSqlDatabaseName = "profilesSqlDatabase";
    var profilesSqlDatabase = sqlServer.AddDatabase(profilesSqlDatabaseName);
    var profilesService = builder.AddProject<Projects.MC_Profiles_API>("profilesService")
        .WithAuth0Parameters(auth0Parameters)
        .WithAuth0ManagementParameters(auth0ManagementParameters)
        .WaitFor(profilesSqlDatabase)
        .WithReference(profilesSqlDatabase, profilesSqlDatabaseName);

    // Catalog Service
    var catalogSqlDatabaseName = "catalogSqlDatabase";
    var catalogMongoDatabaseName = "catalogMongoDatabase";
    var catalogSqlDatabase = sqlServer.AddDatabase(catalogSqlDatabaseName);
    var catalogMongoDatabase = mongoServer.AddDatabase(catalogMongoDatabaseName);
    var catalogService = builder.AddProject<Projects.MC_Catalog_API>("catalogService")
        .WithAuth0Parameters(auth0Parameters)
        .WaitFor(catalogSqlDatabase)
        .WaitFor(catalogMongoDatabase)
        .WithReference(catalogSqlDatabase, catalogSqlDatabaseName)
        .WithReference(catalogMongoDatabase, catalogMongoDatabaseName);

    // React Web App
    var reactwebapp = builder
        .AddViteApp("reactWebApp", "./../../Clients/mc.market.reactwebapp", "dev")
        .WithAuth0WebAppParameters(auth0WebAppParameters);

    // Gateway
    var webStoreGateway = builder.AddProject<Projects.MC_Gateway>("marketCustomsGateway")
        .WithExternalHttpEndpoints()
        .WithReference(profilesService)
        .WithReference(catalogService)
        .WithReference(reactwebapp);

    reactwebapp.WithReference(webStoreGateway);
}
