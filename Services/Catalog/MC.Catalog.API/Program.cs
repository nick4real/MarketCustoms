using MC.Catalog.Application;
using MC.Catalog.Infrastructure;
using MC.Catalog.Infrastructure.Persistence;
using MC.Shared.API;
using MC.Shared.Infrastructure.Interfaces.Persistence;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

// Builder
var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();

builder.AddAuthenticationDefaults();
builder.Services.AddAuthorization();

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddOpenApi();
}

// App
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapDefaultEndpoints();
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();

    using var scope = app.Services.CreateScope();
    var seeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();
    await seeder.SeedAsync();
}

app.Run();

