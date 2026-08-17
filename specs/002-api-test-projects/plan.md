# Implementation Plan: API Test Projects

**Branch**: `002-api-test-projects` | **Date**: 2026-08-17 | **Spec**: `specs/002-api-test-projects/spec.md`

**Input**: Feature specification from `/specs/002-api-test-projects/spec.md`

## Summary

Add a first-class `Tests` area with eight xUnit projects (unit + integration per Catalog, Profiles, Ordering, and Notifications). Unit tests target inner layers with fakes and no I/O. Integration tests host each API through **Aspire.Hosting.Testing** with isolated, session-scoped SQL Server/MongoDB — not the persistent development AppHost, not in-memory stores, and not live Auth0. Catalog and Profiles get meaningful coverage of behavior that already exists; Ordering and Notifications get a minimal stub example.

## Technical Context

**Language/Version**: C# / .NET 10 (`net10.0`), matching existing service and AppHost projects

**Primary Dependencies**: xUnit v3; `Aspire.Hosting.Testing` 13.3.5 (aligned with `Aspire.AppHost.Sdk/13.3.5`); `Aspire.Hosting.SqlServer` and `Aspire.Hosting.MongoDB` for Catalog/Profiles integration; existing ASP.NET Core, EF Core SQL Server, MongoDB driver, Auth0 API auth (production only)

**Storage**: Integration tests use real isolated SQL Server (Catalog categories, Profiles) and MongoDB (Catalog products). Unit tests use no storage. Not the AppHost persistent development databases.

**Testing**: xUnit v3 is the only test framework. `dotnet test MarketCustoms.slnx` runs the full suite. VSTest adapters remain so the repo does not switch to MTP-only.

**Target Platform**: Local developer machines and CI with the .NET 10 SDK; Docker/Podman required for Catalog and Profiles integration tests (Aspire DCP)

**Project Type**: Solution-level test infrastructure for existing clean-architecture web APIs (not a new production service)

**Performance Goals**: Unit tests complete without container startup. Integration hosts are shared per project/run (not per fact) so SQL Server starts once per suite, not once per test. Do not boot Gateway or the React client.

**Constraints**: No frontend/browser/load tests; no Shared-only test project; no in-memory DB fallback; no live identity provider; unit projects must not reference API or Infrastructure; production code changes limited to test-host composition and local test identity

**Scale/Scope**: 4 APIs × 2 test projects = 8 projects; meaningful tests only where behavior already exists (Catalog, Profiles); stubs (Ordering, Notifications) get a layout-proving example

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code quality**: Scoped to test projects plus the minimum AppHost/`Program.cs` hooks needed for isolated hosting and local test identity. No unrelated refactors, no extra mock libraries.
- **Testing**: This feature is the missing automated-test baseline. Meaningful tests must fail if existing Catalog/Profiles behavior breaks; stubs still execute.
- **UX consistency**: No user-facing product change. Client, Gateway, and routes stay untouched.
- **Performance**: Prefer per-service Aspire graphs and one host per integration run over starting the full persistent AppHost. Unit tests have no container cost.
- **Reviewability**: Eight clearly named projects, central package versions, and documented run commands. Isolated containers are discarded with the run.

Post-design: still pass. Aspire testing is the integration approach; Testcontainers is explicitly not added. Local test identity is a narrow, flag-gated hook rather than a permanent auth redesign.

## Project Structure

### Documentation (this feature)

```text
specs/002-api-test-projects/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── test-projects.md
│   └── integration-host.md
└── tasks.md              # created later by /speckit-tasks
```

### Source Code (repository root)

```text
Tests/
├── Catalog/
│   ├── MC.Catalog.UnitTests/
│   │   └── Application/
│   └── MC.Catalog.IntegrationTests/
│       ├── Api/
│       └── Fixtures/
├── Profiles/
│   ├── MC.Profiles.UnitTests/
│   │   └── Application/
│   └── MC.Profiles.IntegrationTests/
│       ├── Api/
│       └── Fixtures/
├── Ordering/
│   ├── MC.Ordering.UnitTests/
│   │   └── Application/
│   └── MC.Ordering.IntegrationTests/
│       ├── Api/
│       └── Fixtures/
└── Notifications/
    ├── MC.Notifications.UnitTests/
    │   └── Application/
    └── MC.Notifications.IntegrationTests/
        ├── Api/
        └── Fixtures/

Aspire/AspireApp.AppHost/
└── AppHost.cs            # add isolated test-service composition (no Persistent, no Gateway/React)

Services/Catalog/MC.Catalog.API/
└── Program.cs            # local test identity when Authentication:UseLocalTestIdentity=true

Services/Profiles/MC.Profiles.API/
└── Program.cs            # same local test identity hook

MarketCustoms.slnx        # /Tests/ solution folders
Directory.Packages.props  # xunit.v3, test SDK, Aspire.Hosting.Testing
```

**Structure Decision**: Mirror production service boundaries under a new top-level `Tests` area. Two projects per service keep unit vs integration obvious. Integration tests use Aspire to compose the same resource names as the AppHost, but only for the service under test and only with session-scoped containers. Production service layout under `Services/` is unchanged aside from the auth test hook.

## Phase 0: Research Output

### `research.md`

- Eight projects, layer folders inside them, xUnit v3 with VSTest adapters.
- Aspire.Hosting.Testing for integration; do not boot the persistent full AppHost; do not use Testcontainers or in-memory stores.
- Local test identity flag for Catalog/Profiles; hand-rolled fakes for unit tests.
- Meaningful vs stub coverage mapped to current service maturity.

## Phase 1: Design Output

### `data-model.md`

- Tests Area, unit/integration projects, isolated supporting systems, authenticated test caller, example vs meaningful tests.

### `contracts/test-projects.md`

- Solution folders, naming, allowed references, packages, `dotnet test` runner contract.

### `contracts/integration-host.md`

- Per-service Aspire resource graph, lifecycle, failure messages, local identity header rules, required HTTP scenarios.

### `quickstart.md`

- Docker vs unit-test prerequisites, filter commands, expected Catalog/Profiles/stub outcomes.

## Complexity Tracking

No constitution violations require justification.
