---

description: "Task list for API Test Projects implementation"
---

# Tasks: API Test Projects

**Input**: Design documents from `/specs/002-api-test-projects/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This feature *is* the automated-test baseline. Do not add a second layer of meta-tests. Production hooks (AppHost isolation, local test identity) are covered by the integration facts in US3.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Production APIs: `Services/{Service}/MC.{Service}.*`
- AppHost: `Aspire/AspireApp.AppHost/`
- New tests: `Tests/{Service}/MC.{Service}.UnitTests/` and `Tests/{Service}/MC.{Service}.IntegrationTests/`
- Solution: `MarketCustoms.slnx`
- Central packages: `Directory.Packages.props`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Tests area and pin the shared test packages so every later project can restore consistently

- [X] T001 Create the top-level Tests area with `Tests/Catalog/`, `Tests/Profiles/`, `Tests/Ordering/`, and `Tests/Notifications/` (sibling to `Services/` and `Aspire/`; no production hosts)
- [X] T002 Add central package versions for `xunit.v3`, `xunit.runner.visualstudio`, `Microsoft.NET.Test.Sdk`, and `Aspire.Hosting.Testing` (13.3.5, aligned with AppHost SDK) in `Directory.Packages.props`
- [X] T003 [P] Add shared test project defaults (`net10.0`, `Nullable`, `ImplicitUsings`, `IsTestProject` true, `IsPackable` false) in `Tests/Directory.Build.props`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Isolated Aspire composition and local test identity so any service's integration tests can host a real API without the persistent AppHost or live Auth0

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Extract the current developer graph (Persistent SQL/Mongo, Gateway, React client) in `Aspire/AspireApp.AppHost/AppHost.cs` so it remains the default when `MarketCustoms:TestService` is unset
- [X] T005 Add isolated per-service composition (session lifetime, no Gateway/React, resource names `catalogSqlDatabase` / `catalogMongoDatabase` / `profilesSqlDatabase` / `catalogService` / `profilesService` / `orderingService` / `notificationsService`) gated by `MarketCustoms:TestService` in `Aspire/AspireApp.AppHost/IsolatedTestComposition.cs`; set `Authentication:UseLocalTestIdentity=true` only on Catalog and Profiles resources
- [X] T006 Implement a local test authentication handler that issues `sub` and `ClaimTypes.NameIdentifier` without contacting Auth0 in `Shared/MC.Shared.API/Authentication/LocalTestAuthenticationHandler.cs`
- [X] T007 [P] When `Authentication:UseLocalTestIdentity` is true, register the local scheme instead of Auth0 and still run SQL `EnsureCreated` for the isolated database in `Services/Catalog/MC.Catalog.API/Program.cs`
- [X] T008 [P] When `Authentication:UseLocalTestIdentity` is true, register the local scheme instead of Auth0 and still run SQL `EnsureCreated` for the isolated database in `Services/Profiles/MC.Profiles.API/Program.cs`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Discoverable Tests Area (Priority: P1) 🎯 MVP

**Goal**: Eight named test projects live under `Tests/`, appear in a Tests solution grouping, and contain no production API hosts

**Independent Test**: Open the workspace and `MarketCustoms.slnx`; confirm a `Tests` area exists at the same level as Services and Aspire, the eight projects are grouped under `/Tests/`, and none live inside Services, Aspire, Gateway, Shared, or Clients

### Implementation for User Story 1

- [X] T009 [P] [US1] Create `Tests/Catalog/MC.Catalog.UnitTests/MC.Catalog.UnitTests.csproj` (`Microsoft.NET.Sdk`, xUnit v3 + VSTest adapters, project reference only to `Services/Catalog/MC.Catalog.Application/MC.Catalog.Application.csproj`, `Application/` folder)
- [X] T010 [P] [US1] Create `Tests/Catalog/MC.Catalog.IntegrationTests/MC.Catalog.IntegrationTests.csproj` (xUnit v3 + `Aspire.Hosting.Testing` + `Aspire.Hosting.SqlServer` + `Aspire.Hosting.MongoDB`, references to `Services/Catalog/MC.Catalog.API/MC.Catalog.API.csproj` and `Aspire/AspireApp.AppHost/AspireApp.AppHost.csproj`, `Api/` and `Fixtures/` folders)
- [X] T011 [P] [US1] Create `Tests/Profiles/MC.Profiles.UnitTests/MC.Profiles.UnitTests.csproj` (same unit rules; reference `Services/Profiles/MC.Profiles.Application/MC.Profiles.Application.csproj`, `Application/` folder)
- [X] T012 [P] [US1] Create `Tests/Profiles/MC.Profiles.IntegrationTests/MC.Profiles.IntegrationTests.csproj` (xUnit v3 + `Aspire.Hosting.Testing` + `Aspire.Hosting.SqlServer`, references to `Services/Profiles/MC.Profiles.API/MC.Profiles.API.csproj` and AppHost, `Api/` and `Fixtures/` folders)
- [X] T013 [P] [US1] Create `Tests/Ordering/MC.Ordering.UnitTests/MC.Ordering.UnitTests.csproj` (unit rules; reference `Services/Ordering/MC.Ordering.Application/MC.Ordering.Application.csproj`, `Application/` folder)
- [X] T014 [P] [US1] Create `Tests/Ordering/MC.Ordering.IntegrationTests/MC.Ordering.IntegrationTests.csproj` (xUnit v3 + `Aspire.Hosting.Testing` only, references to `Services/Ordering/MC.Ordering.API/MC.Ordering.API.csproj` and AppHost, `Api/` and `Fixtures/` folders)
- [X] T015 [P] [US1] Create `Tests/Notifications/MC.Notifications.UnitTests/MC.Notifications.UnitTests.csproj` (unit rules; reference `Services/Notifications/MC.Notifications.Application/MC.Notifications.Application.csproj`, `Application/` folder)
- [X] T016 [P] [US1] Create `Tests/Notifications/MC.Notifications.IntegrationTests/MC.Notifications.IntegrationTests.csproj` (xUnit v3 + `Aspire.Hosting.Testing` only, references to `Services/Notifications/MC.Notifications.API/MC.Notifications.API.csproj` and AppHost, `Api/` and `Fixtures/` folders)
- [X] T017 [US1] Register all eight projects under `/Tests/Catalog/`, `/Tests/Profiles/`, `/Tests/Ordering/`, and `/Tests/Notifications/` in `MarketCustoms.slnx` and confirm the solution builds

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Isolated Tests for Each API Service (Priority: P1)

**Goal**: Each API has a unit-test project that proves inner-layer behavior (or a layout example for stubs) with no database, broker, Docker, or API/Infrastructure references

**Independent Test**: Run `dotnet test MarketCustoms.slnx --filter "FullyQualifiedName~UnitTests"` with Docker stopped; all four unit projects complete. Catalog and Profiles include at least one real application assertion; Ordering and Notifications still pass a minimal example

### Implementation for User Story 2

- [X] T018 [P] [US2] Add an in-test `IProductRepository` fake in `Tests/Catalog/MC.Catalog.UnitTests/Fakes/FakeProductRepository.cs` (no Moq/NSubstitute)
- [X] T019 [P] [US2] Add an in-test `ICategoryRepository` fake in `Tests/Catalog/MC.Catalog.UnitTests/Fakes/FakeCategoryRepository.cs`
- [X] T020 [US2] Add a meaningful `ProductService` test that rejects a non-24-character product id (`ErrorCode.ValidationFailed`) in `Tests/Catalog/MC.Catalog.UnitTests/Application/ProductServiceTests.cs`
- [X] T021 [US2] Add a meaningful `CategoryService` test that rejects an empty category name (`ErrorCode.ValidationFailed`) in `Tests/Catalog/MC.Catalog.UnitTests/Application/CategoryServiceTests.cs`
- [X] T022 [P] [US2] Add in-test fakes for `IProfileRepository` and `ICurrentUserService` in `Tests/Profiles/MC.Profiles.UnitTests/Fakes/FakeProfileRepository.cs` and `Tests/Profiles/MC.Profiles.UnitTests/Fakes/FakeCurrentUserService.cs`
- [X] T023 [US2] Add meaningful `ProfileService` tests: `GetMe` fails when unauthenticated; `GetProfileInfo` returns `"Hidden"` for non-public phone/email in `Tests/Profiles/MC.Profiles.UnitTests/Application/ProfileServiceTests.cs`
- [X] T024 [P] [US2] Add a minimal passing Application-folder example (assembly/layout proof only) in `Tests/Ordering/MC.Ordering.UnitTests/Application/OrderingApplicationExampleTests.cs`
- [X] T025 [P] [US2] Add a minimal passing Application-folder example (assembly/layout proof only) in `Tests/Notifications/MC.Notifications.UnitTests/Application/NotificationsApplicationExampleTests.cs`

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently

---

## Phase 5: User Story 3 - Integration Tests for Each API (Priority: P1)

**Goal**: Each API has a separate integration project that issues HTTP against an Aspire-hosted isolated graph: real SQL/Mongo for Catalog and Profiles, local test identity for `[Authorize]` success paths, and a WeatherForecast example for stubs

**Independent Test**: Run `dotnet test MarketCustoms.slnx --filter "FullyQualifiedName~IntegrationTests"`. Catalog and Profiles use new session-scoped containers (not the developer AppHost DBs) and cover success plus failure plus 401. Ordering and Notifications return HTTP 200 for `GET /WeatherForecast`. Missing Docker fails Catalog/Profiles with a service-named message, not a skip

### Implementation for User Story 3

- [X] T026 [P] [US3] Add a shared-per-run Catalog Aspire fixture (`DistributedApplicationTestingBuilder`, `MarketCustoms:TestService=catalog`, wait for `catalogService`, dispose containers, fail with a Catalog-specific Docker message) in `Tests/Catalog/MC.Catalog.IntegrationTests/Fixtures/CatalogAppFixture.cs`
- [X] T027 [US3] Add Catalog HTTP cases in `Tests/Catalog/MC.Catalog.IntegrationTests/Api/ProductsControllerTests.cs`: anonymous `GET /Products/{invalidId}` → 400; `POST /Products/create` without auth → 401; authenticated create (seed category via `POST /Categories`, then create + `GET /Products/{id}`) → 200 with persistence in isolated SQL and Mongo
- [X] T028 [P] [US3] Add a shared-per-run Profiles Aspire fixture (`MarketCustoms:TestService=profiles`, wait for `profilesService`, fail with a Profiles-specific Docker message) in `Tests/Profiles/MC.Profiles.IntegrationTests/Fixtures/ProfilesAppFixture.cs`
- [X] T029 [US3] Add Profiles HTTP cases in `Tests/Profiles/MC.Profiles.IntegrationTests/Api/ProfilesControllerTests.cs`: `GET /Profiles/me` without auth → 401; with local test identity → 200; authenticated `GET /Profiles/{unknownGuid}` → 404
- [X] T030 [P] [US3] Add an Ordering Aspire fixture (API only, no stores, no local identity) in `Tests/Ordering/MC.Ordering.IntegrationTests/Fixtures/OrderingAppFixture.cs`
- [X] T031 [US3] Add a stub HTTP example `GET /WeatherForecast` → 200 with five items in `Tests/Ordering/MC.Ordering.IntegrationTests/Api/WeatherForecastControllerTests.cs`
- [X] T032 [P] [US3] Add a Notifications Aspire fixture (API only, no stores, no local identity) in `Tests/Notifications/MC.Notifications.IntegrationTests/Fixtures/NotificationsAppFixture.cs`
- [X] T033 [US3] Add a stub HTTP example `GET /WeatherForecast` → 200 with five items in `Tests/Notifications/MC.Notifications.IntegrationTests/Api/WeatherForecastControllerTests.cs`

**Checkpoint**: At this point, User Stories 1, 2, and 3 should all work independently

---

## Phase 6: User Story 4 - Runnable Suite With Meaningful Coverage (Priority: P2)

**Goal**: One `dotnet test` action runs every unit and integration project with a distinct pass/fail per project; Catalog and Profiles would fail if existing behavior broke; stubs still execute an example

**Independent Test**: Run `dotnet test MarketCustoms.slnx` once. All eight projects report. Catalog/Profiles unit + integration facts exercise real behavior (including integration success and failure). Ordering/Notifications still pass their examples. A forced failure is attributed to the correct service and test kind

### Implementation for User Story 4

- [X] T034 [US4] Confirm `dotnet test MarketCustoms.slnx` discovers and reports all eight projects via VSTest adapters in `MarketCustoms.slnx` (no MTP-only `global.json` runner switch)
- [X] T035 [P] [US4] Confirm the unit filter in `specs/002-api-test-projects/quickstart.md` (`FullyQualifiedName~UnitTests`) runs only the four unit projects and does not start containers
- [X] T036 [P] [US4] Confirm the integration filter in `specs/002-api-test-projects/quickstart.md` (`FullyQualifiedName~IntegrationTests`) runs only the four integration projects and discards isolated SQL/Mongo after the run
- [X] T037 [US4] Review Catalog/Profiles facts versus Ordering/Notifications examples so placeholders are not used where real behavior exists (`Tests/**/*Tests.cs`)

**Checkpoint**: The full suite is the one-action check for SC-005

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Layout, package, and quickstart checks that span every story

- [X] T038 [P] Confirm no test projects were added under `Services/`, `Aspire/`, `Gateway/`, `Shared/`, or `Clients/`, and that unit csprojs do not reference API or Infrastructure
- [X] T039 [P] Confirm `Directory.Packages.props` was not given NUnit, MSTest, TUnit, Moq, NSubstitute, or in-memory EF/Mongo test providers
- [X] T040 Run the layout, unit, integration, full-suite, and single-service commands in `specs/002-api-test-projects/quickstart.md`
- [X] T041 Align unused usings and PackageReference versions across `Tests/**/*.csproj` with `Directory.Packages.props`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories. Delivers empty, buildable test homes in the solution
- **User Story 2 (P1)**: Can start after US1 project files exist (T009, T011, T013, T015). Independently testable without Docker or integration projects
- **User Story 3 (P1)**: Can start after US1 integration project files exist (T010, T012, T014, T016) and Foundational AppHost/auth hooks. Independently testable without unit-test content
- **User Story 4 (P2)**: Depends on US2 and US3 having their facts in place so the full suite has meaningful coverage

### Within Each User Story

- Project files before tests that live in those projects
- Fakes before unit facts that use them
- Aspire fixtures before HTTP facts that use them
- Catalog/Profiles meaningful coverage before treating the suite as done
- Story complete before moving to the next priority when staffing is sequential

### Parallel Opportunities

- T003 can run in parallel with T002 once T001 exists
- T007 and T008 can run in parallel after T006
- T009–T016 (all eight csproj files) can run in parallel after Phase 2
- T018/T019/T022/T024/T025 can run in parallel after US1 unit projects exist
- T026/T028/T030/T032 (four fixtures) can run in parallel after US1 integration projects exist
- T035 and T036 can run in parallel during US4
- T038 and T039 can run in parallel during polish
- After Foundational + US1, one developer can own unit tests (US2) while another owns integration tests (US3)

---

## Parallel Example: User Story 1

```bash
# Launch all eight project files together after Phase 2:
Task: "Create Tests/Catalog/MC.Catalog.UnitTests/MC.Catalog.UnitTests.csproj"
Task: "Create Tests/Catalog/MC.Catalog.IntegrationTests/MC.Catalog.IntegrationTests.csproj"
Task: "Create Tests/Profiles/MC.Profiles.UnitTests/MC.Profiles.UnitTests.csproj"
Task: "Create Tests/Profiles/MC.Profiles.IntegrationTests/MC.Profiles.IntegrationTests.csproj"
Task: "Create Tests/Ordering/MC.Ordering.UnitTests/MC.Ordering.UnitTests.csproj"
Task: "Create Tests/Ordering/MC.Ordering.IntegrationTests/MC.Ordering.IntegrationTests.csproj"
Task: "Create Tests/Notifications/MC.Notifications.UnitTests/MC.Notifications.UnitTests.csproj"
Task: "Create Tests/Notifications/MC.Notifications.IntegrationTests/MC.Notifications.IntegrationTests.csproj"
```

## Parallel Example: User Story 2

```bash
# Launch fakes and stub examples together:
Task: "Add Tests/Catalog/MC.Catalog.UnitTests/Fakes/FakeProductRepository.cs"
Task: "Add Tests/Catalog/MC.Catalog.UnitTests/Fakes/FakeCategoryRepository.cs"
Task: "Add Tests/Profiles/MC.Profiles.UnitTests/Fakes/FakeProfileRepository.cs"
Task: "Add Tests/Ordering/MC.Ordering.UnitTests/Application/OrderingApplicationExampleTests.cs"
Task: "Add Tests/Notifications/MC.Notifications.UnitTests/Application/NotificationsApplicationExampleTests.cs"
```

## Parallel Example: User Story 3

```bash
# Launch all four Aspire fixtures together:
Task: "Add Tests/Catalog/MC.Catalog.IntegrationTests/Fixtures/CatalogAppFixture.cs"
Task: "Add Tests/Profiles/MC.Profiles.IntegrationTests/Fixtures/ProfilesAppFixture.cs"
Task: "Add Tests/Ordering/MC.Ordering.IntegrationTests/Fixtures/OrderingAppFixture.cs"
Task: "Add Tests/Notifications/MC.Notifications.IntegrationTests/Fixtures/NotificationsAppFixture.cs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Tests area + eight projects in the solution)
4. **STOP and VALIDATE**: Tests grouping is visible and the solution builds
5. Demo the layout even before facts exist

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP layout)
3. Add User Story 2 → Isolated tests run without Docker → Demo
4. Add User Story 3 → Integration tests against isolated SQL/Mongo → Demo
5. Add User Story 4 → One-command full suite with meaningful Catalog/Profiles coverage
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 project files, then User Story 2 unit facts
   - Developer B: User Story 1 integration csprojs (if not already done), then User Story 3 fixtures and HTTP facts
   - Either: User Story 4 suite validation after A and B merge
3. Stories complete and integrate independently under `Tests/`

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Do not add Moq, NSubstitute, Testcontainers, or in-memory stores
- Do not boot the persistent developer AppHost from tests
- Do not sign in against live Auth0
- Unit projects must not reference API or Infrastructure
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- Avoid: vague tasks, same-file conflicts, combining unit and integration tests in one project
