# Quickstart: API Test Projects

## Prerequisites

- .NET 10 SDK (same as the rest of the solution)
- Docker Desktop or a compatible Podman engine (required for Catalog and Profiles integration tests; Aspire starts real SQL Server and MongoDB)
- Solution restore succeeds: `dotnet restore MarketCustoms.slnx`

Unit tests do not need Docker.

## Validate layout

Confirm a top-level `Tests` area exists next to `Services` and `Aspire`, with eight projects in `MarketCustoms.slnx` under `/Tests/`.

## Run isolated (unit) tests

```powershell
dotnet test MarketCustoms.slnx --filter "FullyQualifiedName~UnitTests"
```

Expected: all four unit projects run without starting databases. Catalog and Profiles include at least one assertion against real application behavior (invalid product id, empty category name, unauthenticated `GetMe`, hidden profile fields). Ordering and Notifications still report a passing example.

## Run integration tests

```powershell
dotnet test MarketCustoms.slnx --filter "FullyQualifiedName~IntegrationTests"
```

Expected:

- Aspire starts a **new** SQL/Mongo (Catalog) or SQL (Profiles) instance for the run and removes it afterward.
- Catalog: invalid product id → 400; create without auth → 401; create with local test identity → success.
- Profiles: `/Profiles/me` without auth → 401; with local identity → 200; unknown profile id → 404.
- Ordering and Notifications: `GET /WeatherForecast` → 200.
- Failures name the service and test project. Missing Docker fails Catalog/Profiles with an explicit host-start error, not a skip.

Do not run the developer AppHost at the same time expecting tests to reuse its persistent containers. Tests must not point at `catalogSqlDatabase` / `profilesSqlDatabase` from a normal `aspire run`.

## Run the full suite

```powershell
dotnet test MarketCustoms.slnx
```

Expected: eight test projects each report pass or fail. This is the one-action check for SC-005.

## Single-service loop

```powershell
dotnet test Tests\Catalog\MC.Catalog.UnitTests\MC.Catalog.UnitTests.csproj
dotnet test Tests\Catalog\MC.Catalog.IntegrationTests\MC.Catalog.IntegrationTests.csproj
```

Repeat with `Profiles`, `Ordering`, or `Notifications` as needed.

## Contracts

- Layout and runner: `contracts/test-projects.md`
- Aspire host, stores, and auth: `contracts/integration-host.md`
- Entities: `data-model.md`
