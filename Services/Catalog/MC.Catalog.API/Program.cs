using Microsoft.EntityFrameworkCore;
using MC.Catalog.Infrastructure.Persistence;
using MC.Catalog.Infrastructure;
using MC.Catalog.Application;
using Scalar.AspNetCore;
using Auth0.AspNetCore.Authentication.Api;

// Builder
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddOpenApi();
}

builder.Services.AddAuth0ApiAuthentication(builder.Configuration.GetSection("Auth0"));
builder.Services.AddAuthorization();

// App
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapDefaultEndpoints();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    await using (var serviceScope = app.Services.CreateAsyncScope())
    await using (var dbContext = serviceScope.ServiceProvider.GetRequiredService<AppRelationalDbContext>())
    {
        var executionStrategy = dbContext.Database.CreateExecutionStrategy();

        await executionStrategy.ExecuteAsync(async () =>
        {
            await dbContext.Database.EnsureDeletedAsync();
            await dbContext.Database.EnsureCreatedAsync();
        });
    }
}

app.Run();
