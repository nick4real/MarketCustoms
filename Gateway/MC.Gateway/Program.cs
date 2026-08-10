// Builder
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Configure the reverse proxy destinations based on Aspire environment variables
void ConfigureReverseProxy()
{
    var clusters = builder.Configuration.GetSection("ReverseProxy:Clusters");

    foreach (var cluster in clusters.GetChildren())
    {
        // Extracts the service name from route key (e.g., "authService-cluster" -> "authService")
        var serviceName = cluster.Key.Replace("-cluster", string.Empty);

        // Look for Aspire service discovery environment variables
        var aspireAddress = Environment.GetEnvironmentVariable($"services__{serviceName}__http__0")
                            ?? Environment.GetEnvironmentVariable($"services__{serviceName}__https__0");

        if (string.IsNullOrEmpty(aspireAddress))
        {
            Console.WriteLine($"Service '{serviceName}' not found");
            continue;
        }

        builder.Configuration[$"ReverseProxy:Clusters:{cluster.Key}:Destinations:destination-1:Address"] = aspireAddress;
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
