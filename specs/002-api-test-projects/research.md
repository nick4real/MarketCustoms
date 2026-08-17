# Research: API Test Projects

## Decision 1: One unit project and one integration project per API

**Decision**: Create eight test projects under a top-level `Tests` area — `MC.{Service}.UnitTests` and `MC.{Service}.IntegrationTests` for Catalog, Profiles, Ordering, and Notifications. Clean-architecture layers are folders inside those projects, not extra projects.

**Rationale**: Matches the spec clarification (8 projects total) and keeps service plus test kind obvious from path and name. Inner-layer tests stay isolated from API/infrastructure; caller-facing tests live separately.

**Alternatives considered**:

- One test project per production layer (16+ projects). Rejected: slower to navigate and duplicates the service split the spec already captures with folders.
- One combined test project per service. Rejected: unit and integration tests must not share a project (FR-004 / edge cases).
- A Shared test project for `MC.Shared.*`. Rejected for this increment: shared code is covered through the services that use it.

## Decision 2: xUnit v3 as the only test framework, with VSTest adapters

**Decision**: Use `xunit.v3` as the primary test framework in every test project. Keep `Microsoft.NET.Test.Sdk` and `xunit.runner.visualstudio` so `dotnet test` and Visual Studio work without switching the repo to Microsoft Testing Platform-only via `global.json`. Do not add NUnit, MSTest, TUnit, or a second assertion framework.

**Rationale**: The spec requires one consistent primary framework (xUnit). The repo has no existing tests and no `global.json` test-runner setting. Enabling MTP-only would be a solution-wide runner change; VSTest adapters keep `dotnet test MarketCustoms.slnx` working as today. xUnit v3 is the current xUnit line for .NET 10.

**Alternatives considered**:

- xUnit v2 only. Rejected: v3 is the supported current line and works on `net10.0`.
- Microsoft Testing Platform-only (`global.json` `test.runner`). Rejected for this increment: extra repo-wide runner migration with no existing tests to migrate.
- FluentAssertions or a second test framework. Rejected: FR-010 forbids additional test frameworks; xUnit asserts are enough.

## Decision 3: Aspire.Hosting.Testing for integration tests (not Testcontainers, not the full dev AppHost)

**Decision**: Integration tests host each API with `Aspire.Hosting.Testing` (`DistributedApplicationTestingBuilder`). Catalog and Profiles start the same SQL Server / MongoDB resource names the production AppHost already uses (`catalogSqlDatabase`, `catalogMongoDatabase`, `profilesSqlDatabase`). Ordering and Notifications start only their API project. Tests must **not** run the production AppHost as-is.

The production AppHost currently uses `ContainerLifetime.Persistent` and also starts Gateway plus the React client. That graph is the shared development environment. Integration tests instead compose a **per-service isolated graph**: only the API under test and the stores it needs, with session-scoped containers created and discarded with the test run.

If Docker/DCP cannot start a required store, the fixture fails with a clear, service-specific message. No skip, hang, or in-memory EF/Mongo substitute.

**Rationale**: The product already wires connection strings and Mongo env vars (`CATALOGMONGODATABASE_URI`, `catalogSqlDatabase`, …) through Aspire `WithReference`. Reusing that orchestration avoids hand-mapping Testcontainers connection strings onto Aspire-specific configuration. `DistributedApplicationTestingBuilder` also randomizes resource names so tests do not attach to the developer’s persistent SQL/Mongo containers.

**Alternatives considered**:

- Testcontainers.MsSql / Testcontainers.MongoDb plus `WebApplicationFactory`. Workable, but duplicates Aspire resource wiring and connection-string names already defined in `Aspire/AspireApp.AppHost/AppHost.cs`.
- Boot `CreateAsync<Projects.AspireApp_AppHost>()` unchanged. Rejected: persistent databases are the shared development store (forbidden by FR-015); Gateway and the React client are out of scope and slow the suite.
- EF Core InMemory / Mongo 2.x in-memory. Rejected by spec: real isolated supporting systems only.
- Aspire.Hosting.Testing against the full AppHost with Persistent lifetime left on. Rejected: risks sharing or leaking development data; GitHub history shows Persistent + testing builder is easy to get wrong.

## Decision 4: Local test authentication inside the API process, not live Auth0

**Decision**: Catalog and Profiles keep Auth0 for Development/Production. When `Authentication:UseLocalTestIdentity=true` (set only by the Aspire test host), they register a local test authentication scheme instead of Auth0. Integration tests:

- omit credentials to assert unauthenticated callers are rejected (401)
- send the local test scheme on success paths, with a `sub` / `NameIdentifier` claim so `CurrentUserService` resolves a user id

No live identity provider, JWKS call, or Auth0 credentials.

**Rationale**: Aspire tests run the API out of process, so `WebApplicationFactory.ConfigureTestServices` cannot swap handlers. An env-flag local scheme is the smallest production hook that satisfies FR-016. `CurrentUserService` already reads `ClaimTypes.NameIdentifier` then `sub`.

**Alternatives considered**:

- `WebApplicationFactory` + `TestAuthHandler` only. Rejected as the primary integration host because it would not reuse Aspire resource wiring; still useful conceptually for the handler implementation.
- Unsigned JWTs with Auth0 validation disabled. Rejected: still couples tests to the Auth0 package and is easier to misconfigure into a network call.
- Real Auth0 login. Rejected by spec.

## Decision 5: Hand-rolled fakes in unit tests; no extra mock framework

**Decision**: Unit projects depend on Application (and Domain as needed) only. Replace repositories and `ICurrentUserService` with small in-test fakes. Do not add Moq or NSubstitute.

**Rationale**: The interfaces under test are few (`IProductRepository`, `ICategoryRepository`, `IProfileRepository`, `ICurrentUserService`). Fakes keep the package graph aligned with Directory.Packages.props and avoid introducing another “framework-like” library. FR-006 forbids unit projects from referencing API or Infrastructure.

**Alternatives considered**:

- NSubstitute/Moq. Rejected for this increment: extra dependency for a handful of interfaces.
- Testing through Infrastructure. Rejected: that is integration territory.

## Decision 6: Meaningful first tests follow current service maturity

**Decision**:

| Service | Kind | First coverage |
|---|---|---|
| Catalog | Unit | `ProductService` rejects a non-24-character product id; `CategoryService` rejects an empty category name |
| Catalog | Integration | Anonymous invalid product id → 400; authenticated create product → success; unauthenticated create → 401. Real SQL + Mongo via Aspire |
| Profiles | Unit | `ProfileService.GetMe` fails when unauthenticated; `GetProfileInfo` hides phone/email when not public |
| Profiles | Integration | Unauthenticated `/Profiles/me` → 401; authenticated `/Profiles/me` → 200; authenticated unknown id → 404. Real SQL via Aspire |
| Ordering | Unit + integration | Minimal example only (template WeatherForecast API; empty Application/Domain) |
| Notifications | Unit + integration | Minimal example only (same stub shape) |

**Rationale**: Catalog and Profiles already have application behavior and storage. Ordering and Notifications are still the default WeatherForecast host with empty inner layers, so placeholders that prove project wiring are what the spec allows.

**Alternatives considered**:

- Placeholder-only tests for Catalog/Profiles. Rejected: spec requires meaningful tests where behavior already exists.
- Exhaustive endpoint coverage. Rejected: out of scope for this increment.
