# Contract: Test project layout and runner

This is the developer- and CI-facing contract for where tests live and how they are run. It does not change production HTTP routes.

## Solution grouping

`MarketCustoms.slnx` MUST add a `/Tests/` folder with one child folder per service:

```text
/Tests/
  /Tests/Catalog/
    Tests/Catalog/MC.Catalog.UnitTests/MC.Catalog.UnitTests.csproj
    Tests/Catalog/MC.Catalog.IntegrationTests/MC.Catalog.IntegrationTests.csproj
  /Tests/Profiles/
    Tests/Profiles/MC.Profiles.UnitTests/MC.Profiles.UnitTests.csproj
    Tests/Profiles/MC.Profiles.IntegrationTests/MC.Profiles.IntegrationTests.csproj
  /Tests/Ordering/
    Tests/Ordering/MC.Ordering.UnitTests/MC.Ordering.UnitTests.csproj
    Tests/Ordering/MC.Ordering.IntegrationTests/MC.Ordering.IntegrationTests.csproj
  /Tests/Notifications/
    Tests/Notifications/MC.Notifications.UnitTests/MC.Notifications.UnitTests.csproj
    Tests/Notifications/MC.Notifications.IntegrationTests/MC.Notifications.IntegrationTests.csproj
```

Project names MUST include the service and `UnitTests` or `IntegrationTests`.

## Project file rules

| Kind | SDK | Target | Allowed project references |
|---|---|---|---|
| Unit | `Microsoft.NET.Sdk` | `net10.0` | `{Service}.Application` (Domain transitive) |
| Integration | `Microsoft.NET.Sdk` | `net10.0` | `{Service}.API`, Aspire hosting/testing packages as needed |

Unit projects MUST NOT reference `{Service}.API` or `{Service}.Infrastructure`.

Every test project MUST set `IsTestProject` to true, MUST NOT be packable, and MUST use central package versions from `Directory.Packages.props`.

## Packages (central versions)

Add to `Directory.Packages.props` (pin current stable, aligned with existing Aspire `13.3.5` and ASP.NET `10.0.1` where applicable):

- `xunit.v3`
- `xunit.runner.visualstudio`
- `Microsoft.NET.Test.Sdk`
- `Aspire.Hosting.Testing` (integration projects only, same major/minor as AppHost SDK `13.3.5`)

Catalog integration also needs `Aspire.Hosting.SqlServer` and `Aspire.Hosting.MongoDB`. Profiles integration needs `Aspire.Hosting.SqlServer`. Ordering and Notifications integration need `Aspire.Hosting.Testing` only.

Do not add NUnit, MSTest, TUnit, Moq, NSubstitute, or in-memory database providers for tests.

## Folder layout inside a test project

```text
MC.{Service}.UnitTests/
  Application/
    {ServiceOrUseCase}Tests.cs
  Domain/          # optional

MC.{Service}.IntegrationTests/
  Api/
    {Controller}Tests.cs
  Fixtures/
    {Service}AppFixture.cs
```

## Runner contract

A single command MUST execute every test project and report pass/fail per project:

```powershell
dotnet test MarketCustoms.slnx
```

Filter examples:

```powershell
dotnet test Tests/Catalog/MC.Catalog.UnitTests/MC.Catalog.UnitTests.csproj
dotnet test Tests/Catalog/MC.Catalog.IntegrationTests/MC.Catalog.IntegrationTests.csproj
```

Unit tests MUST pass on a machine without Docker. Integration tests for Catalog and Profiles REQUIRE a working Docker/Podman engine for Aspire DCP.

## Out of scope (must remain absent)

- Test projects under `Clients/`, `Gateway/`, `Aspire/`, `Shared/`, or `Services/`
- Frontend, browser, or load-test projects
- A Shared-only test project
