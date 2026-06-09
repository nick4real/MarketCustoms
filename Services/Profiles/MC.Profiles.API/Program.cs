using Microsoft.AspNetCore.HttpOverrides;
using Scalar.AspNetCore;
using WebStoreUser.Infrastructure;
using WebStoreUser.Infrastructure.Filters;
using WebStoreUser.Infrastructure.Options;

// Builder
var builder = WebApplication.CreateBuilder(args);

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true)                
    .AddEnvironmentVariables();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("JwtOptions"));

builder.AddServiceDefaults();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationFilter>();
});

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddOpenApi();
}

// App
var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor |
        ForwardedHeaders.XForwardedProto |
        ForwardedHeaders.XForwardedHost,

    ForwardLimit = 1
});
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapDefaultEndpoints();
app.MapControllers();

app.Run();
