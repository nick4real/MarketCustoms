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
        .WithSingleNodeReplicaSet();

    // Credentials are URL-encoded; the default user name is the literal "admin".
    var meUserName = mongoServer.Resource.UserNameParameter is { } userName
        ? ReferenceExpression.Create($"{userName:uri}")
        : ReferenceExpression.Create($"admin");

    mongoServer
        .WithMongoExpress(o =>
        {
            o.WithContainerName("MC.MongoExpress");
            // The replica set advertises localhost:27017, so Mongo Express must not do topology discovery.
            // mongo-express ignores ME_CONFIG_MONGODB_URL while ME_CONFIG_MONGODB_SERVER is set, and Aspire sets it.
            o.WithEnvironment(context =>
            {
                context.EnvironmentVariables.Remove("ME_CONFIG_MONGODB_SERVER");
                context.EnvironmentVariables["ME_CONFIG_MONGODB_URL"] = ReferenceExpression.Create(
                    $"mongodb://{meUserName}:{mongoServer.Resource.PasswordParameter!:uri}@{mongoServer.Resource.Name}:27017/?authSource=admin&directConnection=true");
            });
            o.WithLifetime(ContainerLifetime.Persistent);
        });

    // Profiles Service
    var profilesSqlDatabaseName = "profilesSqlDatabase";
    var profilesSqlDatabase = sqlServer.AddDatabase(profilesSqlDatabaseName);
    var profilesService = builder.AddProject<Projects.MC_Profiles_API>("profilesService")
        .WithAuth0Parameters(auth0Parameters)
        .WithAuth0ManagementParameters(auth0ManagementParameters)
        .WithSeeding(builder.Configuration)
        .WaitFor(profilesSqlDatabase)
        .WithReference(profilesSqlDatabase, profilesSqlDatabaseName);

    // Catalog Service
    var catalogSqlDatabaseName = "catalogSqlDatabase";
    var catalogMongoDatabaseName = "catalogMongoDatabase";
    var catalogSqlDatabase = sqlServer.AddDatabase(catalogSqlDatabaseName);
    var catalogMongoDatabase = mongoServer.AddDatabase(catalogMongoDatabaseName)
        .WithDirectConnectionHealthCheck();
    var catalogService = builder.AddProject<Projects.MC_Catalog_API>("catalogService")
        .WithAuth0Parameters(auth0Parameters)
        .WithSeeding(builder.Configuration)
        .WaitFor(catalogSqlDatabase)
        .WaitFor(catalogMongoDatabase)
        .WithReference(catalogSqlDatabase, catalogSqlDatabaseName)
        .WithReference(catalogMongoDatabase, catalogMongoDatabaseName)
        .WithEnvironment("CATALOGMONGODATABASE_DIRECTCONNECTION", "true");

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
