# Contract: Aspire integration host and local test identity

## Host composition

Each integration project starts **only** the API under test and the stores that API needs. It MUST NOT start Gateway, the React client, or sibling APIs. It MUST NOT use `ContainerLifetime.Persistent`.

| Service | Aspire resources | HTTP client target |
|---|---|---|
| Catalog | `sqlServer` → `catalogSqlDatabase`; `mongoServer` → `catalogMongoDatabase`; `catalogService` | `catalogService` |
| Profiles | `sqlServer` → `profilesSqlDatabase`; `profilesService` | `profilesService` |
| Ordering | `orderingService` | `orderingService` |
| Notifications | `notificationsService` | `notificationsService` |

Resource names MUST match production AppHost names so existing `WithReference` connection strings and Mongo env vars (`CATALOGMONGODATABASE_URI`, `CATALOGMONGODATABASE_DATABASENAME`, `ConnectionStrings:catalogSqlDatabase`, `ConnectionStrings:profilesSqlDatabase`) keep working.

Prefer composing this graph from shared AppHost helpers so names stay in one place, gated so the developer AppHost still uses persistent containers and still starts Gateway/React. Tests pass a configuration value such as `MarketCustoms:TestService=catalog`.

## Lifecycle

1. Fixture starts `DistributedApplicationTestingBuilder` for the isolated graph.
2. Fixture waits until the API resource is running (and backing stores are ready via `WaitFor`).
3. Tests call `app.CreateHttpClient("{serviceName}")`.
4. Fixture disposes the distributed application at the end of the run so containers are discarded.

Share one host per integration project (xUnit collection or class fixture) so SQL Server is not started per fact. Isolation is per **test run**, not per test method.

## Failure mode

If Docker/DCP or a required container cannot start, the fixture MUST fail with a message that names the service, for example:

`Catalog integration host failed to start isolated SQL Server/MongoDB. Ensure Docker is running. This suite does not use the shared development database.`

Do not skip. Do not hang without a timeout. Do not fall back to in-memory storage.

## Local test identity

Set on Catalog and Profiles resources in the test host only:

```text
Authentication:UseLocalTestIdentity = true
```

When that flag is true, the API registers a local authentication scheme and MUST NOT call Auth0.

| Request | Header | Expected on `[Authorize]` endpoints |
|---|---|---|
| Unauthenticated | none | 401 |
| Authenticated | local test scheme (see implementation; include `sub` / `NameIdentifier`) | pipeline authenticates; action runs |

Success-path Catalog tests use the authenticated client against `POST /Products/create` (class-level `[Authorize]`). Success-path Profiles tests use `GET /Profiles/me`.

Anonymous Catalog reads (`GET /Products`, `GET /Products/{id}`, category GETs) stay anonymous; they are not a substitute for the unauthenticated-rejection case.

Ordering and Notifications MUST NOT require this identity.

## Required scenarios (minimum)

### Catalog

- `GET /Products/{invalidId}` → 400 (`ErrorCode.ValidationFailed` / invalid product ID format). Real Mongo is running even if unused for this path.
- `POST /Products/create` without auth → 401.
- `POST /Products/create` with local test identity → 200 and the product can be read back (`GET /Products/{id}`). Category row exists in isolated SQL; product document exists in isolated Mongo.

### Profiles

- `GET /Profiles/me` without auth → 401.
- `GET /Profiles/me` with local test identity → 200 (creates profile on first access).
- `GET /Profiles/{unknownGuid}` with auth → 404.

### Ordering / Notifications (stubs)

- `GET /WeatherForecast` → 200 with five items.

## Production hooks allowed

Small, test-only changes in production projects are in scope when they are required for this contract:

- AppHost: isolated test-service composition (no persistent lifetime, no Gateway/React).
- Catalog and Profiles `Program.cs`: local test identity when `Authentication:UseLocalTestIdentity` is true; schema creation must still run for the isolated SQL database (today that is `EnsureCreated` under Development — keep that behavior for the test host environment).
