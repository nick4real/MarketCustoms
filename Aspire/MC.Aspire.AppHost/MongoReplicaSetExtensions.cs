using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Aspire.Hosting;

public static class MongoReplicaSetExtensions
{
    private const string ScriptPath = "/mongo-replset-entrypoint.sh";

    /// <summary>
    /// Runs the MongoDB container as a single-node replica set (required for transactions).
    /// </summary>
    public static IResourceBuilder<MongoDBServerResource> WithSingleNodeReplicaSet(
        this IResourceBuilder<MongoDBServerResource> builder)
    {
        var scriptFile = Path.Combine(AppContext.BaseDirectory, "Mongo", "mongo-replset-entrypoint.sh");

        // Contents are normalized to LF so a CRLF checkout on Windows can't break the shebang.
        var script = File.ReadAllText(scriptFile).Replace("\r\n", "\n");

        return builder
            .WithContainerFiles("/", [
                new ContainerFile
                {
                    Name = ScriptPath.TrimStart('/'),
                    Contents = script,
                    Mode = UnixFileMode.UserRead | UnixFileMode.UserWrite | UnixFileMode.UserExecute
                         | UnixFileMode.GroupRead | UnixFileMode.GroupExecute
                         | UnixFileMode.OtherRead | UnixFileMode.OtherExecute
                }
            ])
            .WithEntrypoint(ScriptPath)
            .WithDirectConnectionHealthCheck();
    }

    /// <summary>
    /// Replaces Aspire's built-in Mongo health check with one that uses <c>directConnection=true</c>.
    /// The replica set advertises <c>localhost:27017</c>, which the host cannot reach, so a client that
    /// performs topology discovery (Aspire's default) would never see a primary.
    /// </summary>
    public static IResourceBuilder<T> WithDirectConnectionHealthCheck<T>(this IResourceBuilder<T> builder)
        where T : IResourceWithConnectionString
    {
        foreach (var existing in builder.Resource.Annotations.OfType<HealthCheckAnnotation>().ToList())
        {
            builder.Resource.Annotations.Remove(existing);
        }

        var connectionStringProvider = builder.Resource;
        var check = new DirectConnectionMongoHealthCheck();
        builder.ApplicationBuilder.Eventing.Subscribe<ConnectionStringAvailableEvent>(builder.Resource, async (_, ct) =>
        {
            var connectionString = await connectionStringProvider.GetConnectionStringAsync(ct);
            check.Initialize(connectionString ?? throw new DistributedApplicationException(
                $"Connection string for '{builder.Resource.Name}' was unexpectedly null."));
        });

        var key = $"{builder.Resource.Name}_direct_check";
        builder.ApplicationBuilder.Services.AddHealthChecks().Add(new HealthCheckRegistration(key, check, null, null));
        return builder.WithHealthCheck(key);
    }

    private sealed class DirectConnectionMongoHealthCheck : IHealthCheck
    {
        private MongoClient? _client;

        public void Initialize(string connectionString)
        {
            var settings = MongoClientSettings.FromConnectionString(connectionString);
            settings.DirectConnection = true;
            settings.ServerSelectionTimeout = TimeSpan.FromSeconds(5);
            _client = new MongoClient(settings);
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            if (_client is null)
            {
                return HealthCheckResult.Unhealthy("Connection string is not available yet.");
            }

            try
            {
                var hello = await _client.GetDatabase("admin").RunCommandAsync<BsonDocument>(
                    new BsonDocument("hello", 1), cancellationToken: cancellationToken);
                return hello.GetValue("isWritablePrimary", false).ToBoolean()
                    ? HealthCheckResult.Healthy()
                    : HealthCheckResult.Unhealthy("Node is not a writable primary yet.");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy(exception: ex);
            }
        }
    }
}
