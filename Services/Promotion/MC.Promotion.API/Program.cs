using Auth0.AspNetCore.Authentication.Api;
using MC.Promotion.Application;
using MC.Promotion.Infrastructure;
using MC.Promotion.Infrastructure.Persistence;
using MC.Shared.API.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

// Builder
var builder = WebApplication.CreateBuilder(args);
var useLocalTestIdentity = builder.Configuration.GetValue("Authentication:UseLocalTestIdentity", false);

builder.AddServiceDefaults();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();

if (useLocalTestIdentity)
{
    builder.Services.AddAuthentication(LocalTestAuthenticationHandler.SchemeName)
        .AddScheme<AuthenticationSchemeOptions, LocalTestAuthenticationHandler>(
            LocalTestAuthenticationHandler.SchemeName, _ => { });
}
else
{
    builder.Services.AddAuth0ApiAuthentication(builder.Configuration.GetSection("Auth0"));
}

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

if (app.Environment.IsDevelopment() || useLocalTestIdentity)
{
    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    await using (var serviceScope = app.Services.CreateAsyncScope())
    await using (var dbContext = serviceScope.ServiceProvider.GetRequiredService<AppDbContext>())
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
