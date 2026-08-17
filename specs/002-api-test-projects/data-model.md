# Data Model: API Test Projects

This increment adds test homes and fixtures, not new marketplace domain tables. The model below is the test-suite structure the implementation must follow.

## Tests Area

Top-level product area, sibling to `Services`, `Aspire`, `Gateway`, `Shared`, and `Clients`.

**Fields**

- `path`: `Tests/`
- `solutionFolder`: `/Tests/` with per-service child folders
- `containsProductionHosts`: false

**Validation rules**

- All eight test projects live under `Tests/`.
- No test project is created inside `Services`, `Aspire`, `Gateway`, `Shared`, or `Clients`.
- Gateway, Aspire host, and the React client have no test projects in this increment.

## API Service Under Test

One of Catalog, Profiles, Ordering, or Notifications.

**Fields**

- `name`: Catalog \| Profiles \| Ordering \| Notifications
- `hasRealBehavior`: true for Catalog and Profiles; false (stub) for Ordering and Notifications
- `requiresSignIn`: true for Catalog (write endpoints) and Profiles; false for Ordering and Notifications WeatherForecast
- `supportingSystems`: Catalog → SQL Server + MongoDB; Profiles → SQL Server; stubs → none

**Relationships**

- Has exactly one `UnitTestProject`
- Has exactly one `IntegrationTestProject`

## Unit Test Project

Isolated tests for inner-layer behavior of a single service.

**Fields**

- `projectName`: `MC.{Service}.UnitTests`
- `path`: `Tests/{Service}/MC.{Service}.UnitTests/`
- `framework`: xUnit v3
- `layerFolders`: `Application/` required; `Domain/` only if a domain test exists
- `projectReferences`: Application (Domain comes transitively). Must not reference API or Infrastructure

**Validation rules**

- Runs with no database, broker, Docker, or other service.
- Catalog and Profiles include at least one meaningful test of existing behavior.
- Ordering and Notifications include a minimal passing example in an `Application/` folder so the layout is proven.

## Integration Test Project

Caller-facing tests for a single API.

**Fields**

- `projectName`: `MC.{Service}.IntegrationTests`
- `path`: `Tests/{Service}/MC.{Service}.IntegrationTests/`
- `framework`: xUnit v3
- `layerFolders`: `Api/` for HTTP cases; `Infrastructure/` only if a fixture helper belongs there
- `host`: Aspire `DistributedApplicationTestingBuilder` composing only this API and its stores
- `projectReferences`: the service API project plus Aspire hosting/testing packages (API reference is required to orchestrate the host)

**Validation rules**

- Issues HTTP requests against the real API surface and asserts status codes / caller-visible bodies.
- Must not use the shared development database or persistent AppHost containers.
- When a store is required, it is a real isolated instance discarded at the end of the test run.
- Catalog and Profiles include at least one success path and one failure path of real behavior, plus unauthenticated rejection.
- Ordering and Notifications include a minimal HTTP example only (WeatherForecast).

## Isolated Supporting System

A throwaway container started by Aspire for one integration test run.

**Fields**

- `resourceName`: `catalogSqlDatabase` \| `catalogMongoDatabase` \| `profilesSqlDatabase`
- `lifetime`: session (created and discarded with the fixture / test run)
- `sharedWithDevAppHost`: false

**State**

```text
NotStarted → Starting → Ready → RunningTests → Discarded
                 ↘ FailedToStart (fail the suite with a service-specific message)
```

**Validation rules**

- Failure to start is a test failure, not a skip.
- No fallback to EF InMemory, SQLite, or a fake Mongo server.

## Authenticated Test Caller

Local identity used on Catalog and Profiles success paths.

**Fields**

- `scheme`: local test scheme enabled only when `Authentication:UseLocalTestIdentity=true`
- `userId`: value placed in `sub` and/or `NameIdentifier` (consumed by `CurrentUserService`)
- `issuedBy`: the test run (not Auth0)

**Validation rules**

- Must not contact the live identity provider.
- Unauthenticated requests omit the scheme and are rejected on `[Authorize]` endpoints.
- APIs that do not require sign-in (Ordering, Notifications) do not need this entity.

## Example Test vs Meaningful Test

**Example Test**

- Used only for stub services (Ordering, Notifications).
- Proves the project builds, is in the solution, and a test runs.
- May assert a trivial inner-layer fact or that `GET /WeatherForecast` returns HTTP 200 with five items.

**Meaningful Test**

- Used for Catalog and Profiles.
- Would fail if current application or HTTP behavior changed (validation, privacy, auth gate, persistence).
- Must not be `Assert.True(true)` or an empty fact.

## Relationships

```text
Tests Area
  └── API Service (x4)
        ├── Unit Test Project
        │     └── layer folders (Application, optional Domain)
        └── Integration Test Project
              ├── Aspire isolated host
              ├── Isolated Supporting System (Catalog, Profiles)
              └── Authenticated Test Caller (Catalog, Profiles)
```
