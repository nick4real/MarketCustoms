# Stale Catalog and Profiles tests: design

Date: 2026-11-17
Scope: test code only (`Tests/Catalog/MC.Catalog.UnitTests`, `Tests/Profiles/**`). Blocks [Phase 0](2026-11-16-phase-0-foundation-design.md#amendment-2026-11-17-ci-areas-and-pre-existing-test-failures): CI must start green.

## Problem

A local run of the test projects that CI will run found:

| Project | Failure | Cause |
| --- | --- | --- |
| `MC.Catalog.UnitTests` | Doesn't compile | `FakeListingRepository` and `FakeCategoryRepository` don't implement members added to `IListingRepository` (`GetListingsCatalogViewAsync`) and `ICategoryRepository` (`GetCategoryExpandedAsync`) since the tests were written; `PagedCollection<>` moved to `MC.Shared.Application.Models`. |
| `MC.Profiles.UnitTests` | Doesn't compile | The fakes and `ProfileServiceTests` target seller applications, seller profiles and an older `IProfileRepository`. Those were removed in `2192d31` ("remove unnecessary logic", 2026-08-31), 12 days after the tests were written (`37d6305`). |
| `MC.Profiles.IntegrationTests` | 9 of 12 fail | The tests call `POST /Profiles/me`, `/Profiles/me/seller-applications` and `/Profiles/me/seller`, which no longer exist. |

The tests are out of date; the production code is the source of truth. `Catalog.IntegrationTests` and `Shared.UnitTests` pass.

## Goal

The Catalog and Profiles unit and integration tests compile and pass, and they test what the code does today.

## Scope

### Catalog unit tests

- Bring `Fakes/FakeListingRepository.cs` and `Fakes/FakeCategoryRepository.cs` in line with the current interfaces (`IListingRepository`, `ICategoryRepository`), including the `MC.Shared.Application.Models` namespace for `PagedCollection<>`.
- Keep the existing tests (`CategoryServiceTests`, `ListingServiceTests`, `CuratedListingsTests`, `ListingFactoryTests`). Fix them only where the API they call has changed.

### Profiles unit tests

- Delete the fakes for removed types: `FakeSellerApplicationRepository`, `FakeSellerProfileRepository`, and `FakeSellerIdentityService` if it targets a removed interface.
- Update `FakeProfileRepository` (and the other fakes) to the current interfaces: `IProfileRepository`, `IIdentityService`, `ICurrentUserService`, `IUnitOfWork`, whichever `ProfileService` uses today.
- Rewrite `ProfileServiceTests` around the four current `IProfileService` methods. Delete the tests for removed behaviour. At least:
  - `GetMe`: returns the owner profile; `NotFound` when the current user has no profile.
  - `GetProfileInfo`: returns the public profile; `NotFound` for an unknown id.
  - `GetAndEnsureCurrentUserProfile`: `Unauthorized` without a current user; creates the profile on first call; returns the existing profile on later calls.
  - `ClarifyAccountType`: `NotFound` without a profile; updates the account type. The controller marks this endpoint `// TODO`, so the tests cover today's behaviour and change with it.
- Keep `ProfileFactoryTests` and `SeedIdsTests`, fixing them only where they no longer compile.

### Profiles integration tests

- Delete the tests for the removed endpoints (`POST /Profiles/me`, seller applications, `/Profiles/me/seller`).
- Cover the current endpoints through the existing `ProfilesAppFixture` and local test identity:
  - `GET /Profiles/me`: 401 anonymous; 404 for a user without a profile; 200 after the profile has been ensured.
  - `POST /Profiles/me/current-user-metadata`: 401 anonymous; 200 and creates the profile for a new user; idempotent on a second call.
  - `GET /Profiles/{id}`: works anonymously (200) and doesn't expose owner-only contact data; 404 for an unknown id.
  - `POST /Profiles/me/clarify-account-type`: 401 anonymous; 200 with a valid request.
- Keep the passing tests that still match the code.

## Out of scope

- Production code changes. If a test exposes a real bug in the current code, it's reported, not fixed here.
- Ordering and Notifications tests (handled in Phase 0: template tests deleted, CI areas added in Phases 2 and 3).
- New coverage for Catalog beyond what's needed to compile and pass.

## Verification

`dotnet test` passes for `MC.Catalog.UnitTests`, `MC.Catalog.IntegrationTests`, `MC.Profiles.UnitTests`, `MC.Profiles.IntegrationTests` and `MC.Shared.UnitTests` (Docker running). `git diff --stat` shows changes under `Tests/` only.

## TDD

Not applicable in the usual sense: these are tests for existing behaviour. Each new or changed test must pass against the current code; a test that fails points either at a wrong test or at a bug to report.
