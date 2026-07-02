// Builder
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Configure the reverse proxy destinations based on Aspire environment variables
void ConfigureReverseProxy()
{
    var routes = builder.Configuration.GetSection("ReverseProxy:Routes");

    foreach (var route in routes.GetChildren())
    {
        // Extracts the service name from route key (e.g., "authService-route" -> "authService")
        var serviceName = route.Key.Replace("-route", string.Empty);

        // Look for Aspire service discovery environment variables
        var aspireAddress = Environment.GetEnvironmentVariable($"services__{serviceName}__http__0")
                            ?? Environment.GetEnvironmentVariable($"services__{serviceName}__https__0");

        if (string.IsNullOrEmpty(aspireAddress))
        {
            Console.WriteLine($"Service '{serviceName}' not found");
            continue;
        }

        var clusterId = $"{serviceName}-cluster";

        // Update the Route to point to this new ClusterId
        builder.Configuration[$"ReverseProxy:Routes:{route.Key}:ClusterId"] = clusterId;

        // Create/Update the Cluster configuration with the destination address
        builder.Configuration[$"ReverseProxy:Clusters:{clusterId}:Destinations:destination-1:Address"] = aspireAddress;
    }

    var reverseProxyClusters = builder.Configuration.GetSection("ReverseProxy:Clusters");

    foreach (var cluster in reverseProxyClusters.GetChildren())
    {
        Console.WriteLine($"Initialized cluster '{cluster.Key}'");
    }
}
ConfigureReverseProxy();

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// App
var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapDefaultEndpoints();
app.MapReverseProxy();

app.Run();
