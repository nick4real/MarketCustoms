# Feature Specification: API Test Projects

**Feature Branch**: `[002-api-test-projects]`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "I want testing projects for my apis, create them in Tests folder along with Services, Aspire and etc. For now I want to be done only .NET unit and integrational testing. Follow clean architecture during projects setup. As main framework use xunit"

## Clarifications

### Session 2026-08-17

- Q: Should each API service get one unit project and one integration project, or a separate test project for every production layer? → A: One unit-test project and one integration-test project per service (8 total). Folders inside each project match the layers.
- Q: Should the first tests only prove the projects run, or should they cover real behavior that the APIs already have? → A: Meaningful tests of existing behavior: at least one real unit case plus one real integration success and failure per service that already has behavior; stub services get a minimal example.
- Q: When an integration test needs a database or other supporting system, should it use a real isolated instance, an in-memory substitute, or no storage at all? → A: Isolated real supporting systems (created and discarded with the test run; not the shared development database).
- Q: When an API requires a signed-in caller, how should integration tests handle that? → A: Assert that unauthenticated callers are rejected, and run success paths as an authenticated test caller.
- Q: Should that authenticated test caller be a local test identity, or a real sign-in against the live identity provider? → A: Local test identity issued or simulated inside the test run; no live identity provider.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discoverable Tests Area (Priority: P1)

As a developer working on backend APIs, I can find all automated tests in a dedicated Tests area that sits alongside Services, Aspire, and the other product areas, so I always know where new tests belong.

**Why this priority**: Without a first-class Tests area, tests get scattered, are hard to discover, and cannot follow a consistent layout. Everything else depends on this home existing.

**Independent Test**: Open the product workspace and confirm a Tests area exists at the same level as Services and Aspire, is part of the solution, and contains no production API hosts.

**Acceptance Scenarios**:

1. **Given** the current product layout with Services, Aspire, Gateway, Shared, and Clients, **When** a developer inspects the workspace, **Then** a Tests area exists at that same top level.
2. **Given** the Tests area, **When** a developer opens the solution, **Then** the test projects appear in a Tests grouping and can be built with the rest of the product.
3. **Given** the Tests area, **When** a developer looks for frontend, browser, or load tests, **Then** none are present in this increment.

---

### User Story 2 - Isolated Tests for Each API Service (Priority: P1)

As a developer, I can add and run isolated (unit) tests for each backend API service so I can prove business rules and use-case behavior without starting databases, other services, or the full product host.

**Why this priority**: Isolated tests are the fastest safety net for API behavior and are required before slower cross-component tests have value.

**Independent Test**: For any existing backend API service, open its unit-test home, run those tests alone, and confirm they complete without external systems.

**Acceptance Scenarios**:

1. **Given** Catalog, Profiles, Ordering, and Notifications API services, **When** a developer looks in Tests, **Then** each service has a dedicated place for isolated tests.
2. **Given** a service that already has business rules or use cases, **When** its isolated tests run, **Then** at least one test exercises that real behavior (not a placeholder that always passes).
3. **Given** an isolated test for a service, **When** it runs, **Then** it does not require a database, message broker, or another running service.
4. **Given** clean-architecture layering, **When** a developer adds an isolated test, **Then** they place it in the matching layer folder inside that service's unit-test project, and the test does not depend on outer layers (the public API entry point or storage and other external connections).

---

### User Story 3 - Integration Tests for Each API (Priority: P1)

As a developer, I can add and run integration tests that exercise each API the way a caller would, so I can verify real request and response behavior including success and failure cases.

**Why this priority**: Isolated tests cannot prove that the API surface, wiring, and supporting infrastructure work together. Integration tests close that gap for the APIs.

**Independent Test**: For any existing backend API, run its integration tests and confirm they exercise caller-facing behavior independently of the unit-test projects.

**Acceptance Scenarios**:

1. **Given** Catalog, Profiles, Ordering, and Notifications APIs, **When** a developer looks in Tests, **Then** each API has a dedicated place for integration tests, separate from its isolated tests.
2. **Given** an API that already exposes caller-facing behavior, **When** its integration tests run, **Then** they cover at least one successful outcome and one unsuccessful outcome of that real behavior.
3. **Given** an integration test, **When** it runs, **Then** it issues requests against the API surface and asserts caller-visible outcomes (success and error responses).
4. **Given** clean-architecture layering, **When** a developer adds an integration test, **Then** the test may compose outer layers (API and infrastructure) while still treating domain rules as the source of truth.
5. **Given** an integration test that needs storage or another supporting system, **When** it runs, **Then** it uses a real isolated instance created and discarded for that run, and it does not use the shared development database.
6. **Given** an API that requires a signed-in caller, **When** an unauthenticated request is made, **Then** the caller is rejected.
7. **Given** an API that requires a signed-in caller, **When** a success-path integration test runs, **Then** it calls as an authenticated test caller whose identity is issued or simulated locally inside the test run, without contacting the live identity provider.

---

### User Story 4 - Runnable Suite With Meaningful Coverage (Priority: P2)

As a developer, I can run the full unit and integration suite in one action and see a clear pass or fail per project, with tests that would fail if existing API behavior broke — and only a minimal example where a service is still a stub.

**Why this priority**: Empty or always-passing placeholders do not protect current behavior. Meaningful tests make the suite immediately useful without requiring coverage of every existing endpoint.

**Independent Test**: Run the complete automated test set once and confirm every test project reports a result; for services with real behavior, confirm at least one unit test and one integration success plus failure exercise that behavior.

**Acceptance Scenarios**:

1. **Given** the Tests area is in the solution, **When** a developer runs all automated tests, **Then** every unit and integration project executes and reports pass or fail.
2. **Given** a service that already has behavior, **When** the suite runs, **Then** its unit project includes at least one test of that behavior, and its integration project includes at least one success path and one failure path for a real caller-facing action.
3. **Given** a stub service with little or no real behavior, **When** the suite runs, **Then** its test projects still contain a minimal passing example so the layout is proven.
4. **Given** a failing test, **When** the suite runs, **Then** the failure is attributed to the correct service and test kind.

---

### Edge Cases

- A service with little or no real behavior (a stub) still receives unit and integration test homes, each with a minimal example so future tests have a place to land.
- A service that already has behavior MUST NOT satisfy coverage with a placeholder test that always passes.
- Integration tests that need storage or other supporting systems MUST use a real isolated instance created and discarded with the test run, never the shared development database.
- Integration tests that cannot obtain that isolated supporting system fail with a clear, service-specific message rather than a silent skip, a hang, or a fallback to an in-memory substitute.
- Shared libraries used by several APIs are exercised through those services' tests in this increment, not through a separate Shared test area.
- Unit and integration tests for the same service must not live in the same project.
- Adding tests for a future API service must follow the same Tests layout without moving existing projects.
- Gateway, Aspire host, and the React client remain without test projects in this increment.
- For an API that requires a signed-in caller, an unauthenticated request is rejected; success paths do not bypass that gate.
- The authenticated test caller is a local test identity created inside the test run. Tests do not sign in against the live identity provider and do not require its credentials or network access.
- APIs that do not require a signed-in caller are not forced to include an unauthenticated-rejection case.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A dedicated Tests area MUST exist at the same top level as Services, Aspire, Gateway, Shared, and Clients.
- **FR-002**: All test projects created in this increment MUST live under that Tests area and MUST be registered in the existing solution under a Tests grouping.
- **FR-003**: Each existing backend API service (Catalog, Profiles, Ordering, Notifications) MUST have exactly one dedicated unit-test project.
- **FR-004**: Each existing backend API service MUST have exactly one dedicated integration-test project, separate from its unit-test project.
- **FR-005**: Test project layout MUST mirror production service boundaries. Service and test kind (unit versus integration) MUST be obvious from project location and name. Clean-architecture layers MUST appear as folders (or equivalent groupings) inside each test project, not as additional test projects.
- **FR-006**: Unit-test projects MUST depend only on inner layers (domain and/or application) and MUST NOT depend on the public API entry point or on storage and other external connections.
- **FR-007**: Integration-test projects MAY compose outer layers (the public API entry point and supporting infrastructure) in order to exercise caller-facing API behavior.
- **FR-008**: Unit tests MUST run without databases, message brokers, or other running services.
- **FR-009**: For each API that already exposes caller-facing behavior, integration tests MUST exercise that real behavior with at least one successful outcome and one unsuccessful outcome. Exhaustive coverage of every endpoint is not required.
- **FR-010**: Every test project MUST use one consistent primary test framework. Additional test frameworks MUST NOT be introduced in this increment.
- **FR-011**: For each service that already has business rules or use cases, the unit-test project MUST include at least one test of that real behavior. Stub services with little or no real behavior MUST still include a minimal passing example in each of their test projects.
- **FR-015**: When an integration test needs storage or another supporting system, it MUST use a real isolated instance that is created and discarded with the test run. It MUST NOT use the shared development database, and it MUST NOT substitute an in-memory or fake store for that dependency.
- **FR-016**: For each API that requires a signed-in caller, integration tests MUST assert that an unauthenticated caller is rejected, and MUST run success paths as an authenticated test caller. They MUST NOT disable that gate to make tests pass. The authenticated test caller MUST be a local test identity issued or simulated inside the test run. Tests MUST NOT sign in against the live identity provider.
- **FR-012**: Client-application, browser, and performance tests MUST NOT be added in this increment.
- **FR-013**: Production source MUST remain in Services, Aspire, Gateway, Shared, and Clients; test projects MUST NOT be created inside those areas.
- **FR-014**: Naming MUST make the service and test kind obvious (unit versus integration) without opening the project.

### Key Entities

- **Tests Area**: Top-level product area that holds all automated test projects for this increment, sibling to Services, Aspire, Gateway, Shared, and Clients.
- **API Service**: One of the existing backend APIs (Catalog, Profiles, Ordering, Notifications), each already split into domain, application, infrastructure, and API layers.
- **Unit Test Project**: A test home for isolated verification of inner-layer behavior for a single API service. Contains layer folders (domain and/or application) rather than depending on a separate project per layer.
- **Integration Test Project**: A test home for caller-facing verification of a single API, composing outer layers as needed. Contains layer folders where integration cases belong (API and, when needed, infrastructure). When storage is required, tests use a real isolated supporting system discarded after the run.
- **Example Test**: A minimal passing test used only when a service is still a stub, to prove the project is wired correctly.
- **Meaningful Test**: A test of behavior the service already has, which would fail if that behavior broke.
- **Authenticated Test Caller**: A signed-in caller used by integration tests when exercising success paths on APIs that require sign-in. Identity is issued or simulated locally inside the test run and does not use the live identity provider.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing backend API services (Catalog, Profiles, Ordering, Notifications) have both a unit-test home and a separate integration-test home.
- **SC-002**: A developer new to the repository can identify where to add a unit test versus an integration test for a given service in under 2 minutes by inspecting the Tests area.
- **SC-003**: Isolated tests for each service complete without any external system being available.
- **SC-004**: Integration tests for each API that already has behavior produce caller-visible pass/fail results for at least one real success path and one real failure path.
- **SC-005**: The complete automated test set can be executed in one action and reports a distinct pass/fail result for every test project.
- **SC-006**: 100% of test projects created in this increment live under the top-level Tests area; none live inside Services, Aspire, Gateway, Shared, or Clients.
- **SC-007**: Adding tests for a new API service later can follow the same layout without relocating existing test projects.
- **SC-008**: For every service that already has behavior, at least one isolated test fails if that existing behavior is broken. Stub services still have a runnable minimal example.
- **SC-009**: Integration tests that persist or read data do so against a real isolated supporting system that is not the shared development database, and that system is gone when the run finishes.
- **SC-010**: For every API that requires a signed-in caller, an unauthenticated request is rejected, and at least one successful caller-facing action completes as an authenticated test caller.
- **SC-011**: Authenticated integration tests complete without live identity-provider credentials and without contacting the live identity provider.

## Assumptions

- "My APIs" means the four backend services already in the product: Catalog, Profiles, Ordering, and Notifications. Gateway, Aspire, Shared, and the React client are out of scope for this increment.
- This increment delivers the test project structure plus meaningful tests of existing behavior (at least one real unit case and one real integration success plus failure per service that already has behavior). It is not exhaustive coverage of every existing endpoint or rule. Stub services get a minimal example only.
- Clean architecture is already how production services are split (domain, application, infrastructure, API). Test projects follow that split: unit tests target inner layers; integration tests target the API surface and may use infrastructure.
- Each service has exactly two test projects: one unit and one integration (eight projects across the four APIs). Layer-specific folders inside those projects keep the clean-architecture boundary visible; there is not one test project per production layer.
- xUnit is the only test framework for this increment, as requested.
- When integration tests need storage or another supporting system, they use a real isolated instance created and discarded with the test run. They do not use the shared development database and do not replace that dependency with an in-memory or fake store.
- Shared code is covered indirectly through the services that use it; dedicated Shared test projects are deferred.
- Existing solution and package-version management will be reused so test projects join the current product rather than forming a separate solution.
- Catalog and Profiles currently require a signed-in caller. Ordering and Notifications are treated according to whether they require sign-in at the time tests are written. The authenticated test caller is always a local test identity; the live identity provider is not used in this increment.
