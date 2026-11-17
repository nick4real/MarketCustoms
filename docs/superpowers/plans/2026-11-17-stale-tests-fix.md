# Stale Catalog and Profiles tests: plan

Date: 2026-11-17
Spec: [2026-11-17-stale-tests-fix-design.md](../specs/2026-11-17-stale-tests-fix-design.md)

**TDD:** no. These are tests for existing behaviour (see the spec). Every test must pass against the current production code, which is not changed.

**Execution:** the three tasks touch different test projects, so three `dotnet-coder` agents run in parallel. Each task then gets a `dotnet-reviewer` pass on its `git diff`. `test-runner` does the final run.

**Rule for every task:** if a test can't pass without a production code change, stop and report the test, the expected and actual behaviour, and the suspected bug. Don't change anything outside the task's test project.

---

## Task 1: Catalog unit tests compile and pass

**Files (only):** `Tests/Catalog/MC.Catalog.UnitTests/**`
- `Fakes/FakeListingRepository.cs`: implement `IListingRepository` as it is now (`Services/Catalog/MC.Catalog.Application/Interfaces/Repositories/IListingRepository.cs`), including `GetListingsCatalogViewAsync` returning `PagedCollection<ListingCardView>` from `MC.Shared.Application.Models`.
- `Fakes/FakeCategoryRepository.cs`: implement `ICategoryRepository` as it is now, including `GetCategoryExpandedAsync`.
- The existing test classes are fixed only where they no longer compile.

**Verify:** `dotnet test Tests/Catalog/MC.Catalog.UnitTests/MC.Catalog.UnitTests.csproj`: green, and no test deleted.

## Task 2: Profiles unit tests

**Files (only):** `Tests/Profiles/MC.Profiles.UnitTests/**`
- Delete `Fakes/FakeSellerApplicationRepository.cs`, `Fakes/FakeSellerProfileRepository.cs`, and `Fakes/FakeSellerIdentityService.cs` if no current interface matches it (otherwise turn it into a fake of `IIdentityService`).
- Update `FakeProfileRepository`, `FakeCurrentUserService` and `FakeUnitOfWork` to the interfaces `ProfileService` uses today (`Services/Profiles/MC.Profiles.Application/Services/ProfileService.cs`).
- Rewrite `Application/ProfileServiceTests.cs`. Keep the existing naming style (`Method_condition_result`). Cases:
  - `GetMe`: owner profile returned; `NotFound` without a profile.
  - `GetProfileInfo`: public profile returned; `NotFound` for an unknown id.
  - `GetAndEnsureCurrentUserProfile`: `Unauthorized` without a current user; first call creates the profile; second call returns the same profile without creating another.
  - `ClarifyAccountType`: `NotFound` without a profile; account type updated on success.
- `Infrastructure/ProfileFactoryTests.cs` and `Infrastructure/SeedIdsTests.cs` are fixed only where they no longer compile.

**Verify:** `dotnet test Tests/Profiles/MC.Profiles.UnitTests/MC.Profiles.UnitTests.csproj`: green. `grep -ri seller` in the project matches no references to the removed seller types.

## Task 3: Profiles integration tests

**Files (only):** `Tests/Profiles/MC.Profiles.IntegrationTests/**` (`Api/ProfilesControllerTests.cs`, and `Fixtures/ProfilesAppFixture.cs` only if needed)
- Delete the tests for `POST /Profiles/me`, `/Profiles/me/seller-applications` and `/Profiles/me/seller`.
- Keep the passing tests that match the current code.
- Cover the current endpoints (`Services/Profiles/MC.Profiles.API/Controllers/ProfilesController.cs`) with the local test identity:
  - `GET /Profiles/me`: 401 anonymous; 404 without a profile; 200 after `current-user-metadata`.
  - `POST /Profiles/me/current-user-metadata`: 401 anonymous; 200 and profile created for a new user; a second call returns the same profile.
  - `GET /Profiles/{id}`: 200 anonymously, no owner-only contact fields in the body; 404 for an unknown id.
  - `POST /Profiles/me/clarify-account-type`: 401 anonymous; 200 with a valid request (shape from `ClarifyAccountTypeRequest`).
- Each test uses its own user id, so tests don't depend on each other or on order.

**Verify:** `dotnet test Tests/Profiles/MC.Profiles.IntegrationTests/MC.Profiles.IntegrationTests.csproj` (Docker running): green.

## Task 4: Review and final run

- `dotnet-reviewer` for each task's diff against the spec. Blocking findings go back to the coder.
- `test-runner` runs every CI area: `MC.Shared.UnitTests`, `MC.Catalog.UnitTests`, `MC.Catalog.IntegrationTests`, `MC.Profiles.UnitTests`, `MC.Profiles.IntegrationTests`.
- `git diff --stat` shows changes under `Tests/` only (apart from the Phase 0 files already changed).

Then Phase 0, Task 7 continues.
