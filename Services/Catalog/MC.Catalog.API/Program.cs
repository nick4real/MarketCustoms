using Microsoft.EntityFrameworkCore;
using WebStoreProduct.Infrastructure.Persistence;
using WebStoreProduct.Infrastructure;
using WebStoreProduct.Application;
using Scalar.AspNetCore;

// Builder
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// App
var app = builder.Build();

app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapDefaultEndpoints();
app.MapControllers();

await using (var serviceScope = app.Services.CreateAsyncScope())
await using (var dbContext = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>())
{
    var executionStrategy = dbContext.Database.CreateExecutionStrategy();

    await executionStrategy.ExecuteAsync(async () =>
    {
        if (!app.Environment.IsProduction())
        {
            await dbContext.Database.EnsureDeletedAsync();
            await dbContext.Database.EnsureCreatedAsync();
        }
    });
}

app.Run();
