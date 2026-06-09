// Builder
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Configure the reverse proxy destinations based on Aspire environment variables
void ConfigureReverseProxy()
{
    var reverseProxyClusters = builder.Configuration.GetSection("ReverseProxy:Clusters");

    foreach (var cluster in reverseProxyClusters.GetChildren())
    {
        var clusterName = cluster.Key.Replace("-cluster", string.Empty);

        var clusterAddress = builder.Configuration.GetSection($"ReverseProxy:Clusters:{cluster.Key}:Destinations:destination-1:Address");
        var aspireAddress = Environment.GetEnvironmentVariable($"services__{clusterName}__http__0")!;

        clusterAddress.Value = aspireAddress;
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
