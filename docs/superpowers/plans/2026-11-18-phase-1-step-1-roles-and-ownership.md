# Phase 1, step 1: Roles and ownership — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Catalog authorizes from Auth0 permissions and takes a listing's owner from the access token; Profiles keeps the Auth0 `seller` role and the `profile_id` app-metadata in sync with the profile; the client lets a user pick their account type and refreshes its token.

**Architecture:** Auth0 RBAC puts a `permissions` array in the access token, and a post-login Action adds the profile id as a namespaced claim. `MC.Shared.API` turns permissions into ASP.NET policies; `ICurrentUserService` exposes the profile id and permissions. Profiles calls the Auth0 Management API *before* saving, so the profile and the token never disagree.

**Tech Stack:** .NET 10, ASP.NET Core authorization policies, Auth0 (RBAC, Actions, Management API), FluentValidation, xUnit v3 + Aspire.Hosting.Testing, React + TypeScript + Vitest, `@auth0/auth0-react`.

**Spec:** [`docs/superpowers/specs/2026-11-18-phase-1-seller-catalog-design.md`](../specs/2026-11-18-phase-1-seller-catalog-design.md), decision 1 and "Order of work" step 1. Steps 2–4 (lifecycle, images, cache) get their own plans.

## Global Constraints

- Work on branch `feat/phase-1-roles-and-ownership`; one PR into `main`; `ci-ok` must pass.
- Permissions (exact strings): `listings:write`, `listings:moderate`, `categories:write`.
- Auth0 roles: `seller` = `listings:write`; `admin` = every API permission.
- Profile id claim type (exact): `https://marketcustoms/profile_id`. Permissions claim type: `permissions`.
- Catalog authorizes from permissions only, never role names.
- Profiles calls Auth0 first and saves only when Auth0 succeeded; on failure nothing is saved and an error is returned.
- `is_seller` (app_metadata write and local-test option) is removed. `IsSeller` in profile responses stays.
- Shared projects must not contain business vocabulary: permission names live in Catalog, not in `MC.Shared.*`.
- Local and CI tests never call Auth0: they use `LocalTestAuthenticationHandler` and `NoOpIdentityService`.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. A token with `listings:write` but no profile-id claim creating a listing must get 403 with a clear message, never a listing owned by `Guid.Empty` and never 500. (Task 2, `CreateListingAsync_fails_with_forbidden_when_token_has_no_profile_id`.)
2. `clarify-account-type` with an unknown or empty type (`"Seller"`, `""`) must return 400; today `Enum.Parse` throws and returns 500. (Task 3, validator tests + `Clarify_account_type_with_unknown_type_returns_400`.)
3. When Auth0 fails during an account-type change, the stored account type must stay unchanged. (Task 3, `ClarifyAccountType_keeps_account_type_when_identity_provider_fails`.)
4. A returning user whose token already carries their profile id must not cost an Auth0 call per login. (Task 3, `GetAndEnsureCurrentUserProfile_skips_identity_provider_when_token_has_profile_id`.)
5. The local-test header with spaces or empty entries (`permissions= listings:write , ,categories:write`) must yield exactly the two trimmed permissions. (Task 1, `Permissions_option_is_split_and_trimmed`.)

---

### Task 1: Shared identity — claims, current user, permission policies, test identity

**Files:**
- Create: `Services/Shared/MC.Shared.Application/Common/AuthClaimTypes.cs`
- Modify: `Services/Shared/MC.Shared.Application/Interfaces/Services/ICurrentUserService.cs`
- Modify: `Services/Shared/MC.Shared.Infrastructure/Services/Auth0CurrentUserService.cs`
- Create: `Services/Shared/MC.Shared.API/AuthorizationExtension.cs`
- Modify: `Services/Shared/MC.Shared.API/Authentication/LocalTestAuthenticationHandler.cs`
- Modify: `Tests/Profiles/MC.Profiles.UnitTests/Fakes/FakeCurrentUserService.cs` (compile only)
- Test: `Tests/Shared/MC.Shared.UnitTests/Authentication/LocalTestAuthenticationHandlerTests.cs`, `Tests/Shared/MC.Shared.UnitTests/Authorization/PermissionPolicyTests.cs`, `Tests/Shared/MC.Shared.UnitTests/Services/Auth0CurrentUserServiceTests.cs`

**Interfaces:**
- Produces:
  - `public static class AuthClaimTypes { public const string ProfileId = "https://marketcustoms/profile_id"; public const string Permissions = "permissions"; }` (namespace `MC.Shared.Application.Common`)
  - `ICurrentUserService` gains `Guid? ProfileId { get; }` and `bool HasPermission(string permission);`
  - `IServiceCollection AddPermissionAuthorization(params string[] permissions)` (C# 14 extension block in `MC.Shared.API.AuthorizationExtension`): calls `AddAuthorization` and registers one policy per permission, named exactly the permission, requiring claim `AuthClaimTypes.Permissions` with that value.
  - Local-test header options: `permissions=a,b` (comma-separated, trimmed, empties dropped; one `permissions` claim each) and `profile_id=<guid>` (one `AuthClaimTypes.ProfileId` claim; ignored when not a Guid). The `is_seller` option is removed.

- [ ] **Step 1: Write the failing tests**

`LocalTestAuthenticationHandlerTests` (build the handler with `new LocalTestAuthenticationHandler(optionsMonitor, NullLoggerFactory.Instance, UrlEncoder.Default)`, `InitializeAsync(new AuthenticationScheme(SchemeName, null, typeof(LocalTestAuthenticationHandler)), context)`, then `AuthenticateAsync()`):
- `Permissions_option_adds_one_claim_per_permission`: header `LocalTest u1;permissions=listings:write,categories:write` → `principal.FindAll("permissions")` values equal `["listings:write", "categories:write"]`.
- `Permissions_option_is_split_and_trimmed`: header `LocalTest u1;permissions= listings:write , ,categories:write` → same two values.
- `Profile_id_option_adds_profile_id_claim`: header with `profile_id=3f2b9c1e-0000-4000-8000-000000000001` → `FindFirstValue(AuthClaimTypes.ProfileId)` equals that string.
- `Profile_id_option_is_ignored_when_not_a_guid`: `profile_id=abc` → no such claim.
- `Is_seller_option_is_no_longer_recognised`: `is_seller=true` → `FindFirst("is_seller")` is null.

`PermissionPolicyTests` (build a `ServiceCollection` with `AddLogging()` and `AddPermissionAuthorization("listings:write")`, resolve `IAuthorizationService`):
- `Policy_succeeds_when_principal_has_permission_claim`
- `Policy_fails_when_principal_lacks_permission_claim` (principal with `permissions=categories:write` only)

`Auth0CurrentUserServiceTests` (`HttpContextAccessor` over a `DefaultHttpContext` with `User` set):
- `ProfileId_reads_profile_id_claim` → equals the Guid.
- `ProfileId_is_null_when_claim_missing_or_not_a_guid`
- `HasPermission_is_true_only_for_present_permission`

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test Tests/Shared/MC.Shared.UnitTests`
Expected: build errors (`AuthClaimTypes`, `AddPermissionAuthorization`, `ProfileId` don't exist). Add a `ProjectReference` to `MC.Shared.Infrastructure` in the test project only if it isn't reachable transitively (it is, through `MC.Shared.API`).

- [ ] **Step 3: Implement**

`AuthClaimTypes`, the two `ICurrentUserService` members, `Auth0CurrentUserService.ProfileId` (`Guid.TryParse` of the claim) and `HasPermission` (`User?.HasClaim(AuthClaimTypes.Permissions, permission) ?? false`), `AddPermissionAuthorization`, and the handler changes. Add `ProfileId { get; set; }` and a `HashSet<string> Permissions` backing `HasPermission` to the Profiles `FakeCurrentUserService` so it compiles.

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test Tests/Shared/MC.Shared.UnitTests && dotnet build Tests/Profiles/MC.Profiles.UnitTests`
Expected: all Shared tests PASS; Profiles unit tests build.

- [ ] **Step 5: Commit**

```bash
git add Services/Shared Tests/Shared Tests/Profiles/MC.Profiles.UnitTests/Fakes
git commit -m "feat(shared): permission policies, profile id claim and test identity options"
```

### Task 2: Catalog — permission-protected writes and owner from the token

**Files:**
- Create: `Services/Catalog/MC.Catalog.Application/Common/Permissions.cs`
- Modify: `Services/Catalog/MC.Catalog.API/Program.cs` (replace `builder.Services.AddAuthorization()` with `builder.Services.AddPermissionAuthorization(Permissions.All)`)
- Modify: `Services/Catalog/MC.Catalog.API/Controllers/CategoriesController.cs` (`CreateCategory`)
- Modify: `Services/Catalog/MC.Catalog.API/Controllers/ListingsController.cs` (`CreateListing`)
- Modify: `Services/Catalog/MC.Catalog.Application/Requests/CreateListingRequest.cs` (drop `OwnerGuid`)
- Modify: `Services/Catalog/MC.Catalog.Application/Services/ListingService.cs` (inject `ICurrentUserService`; `CreateListingAsync`)
- Create: `Tests/Catalog/MC.Catalog.UnitTests/Fakes/FakeCurrentUserService.cs`
- Modify: `Tests/Catalog/MC.Catalog.UnitTests/Application/ListingServiceTests.cs`
- Modify: `Tests/Catalog/MC.Catalog.IntegrationTests/Fixtures/CatalogAppFixture.cs`
- Modify: `Tests/Catalog/MC.Catalog.IntegrationTests/Api/ListingsControllerTests.cs`
- Create: `Tests/Catalog/MC.Catalog.IntegrationTests/Api/CategoriesControllerTests.cs`

**Interfaces:**
- Consumes: `AuthClaimTypes`, `ICurrentUserService.ProfileId/HasPermission`, `AddPermissionAuthorization` (Task 1).
- Produces:
  - `public static class Permissions { ListingsWrite = "listings:write"; ListingsModerate = "listings:moderate"; CategoriesWrite = "categories:write"; public static readonly string[] All = [ListingsWrite, ListingsModerate, CategoriesWrite]; }` (namespace `MC.Catalog.Application.Common`). Step 2's ownership check uses `ListingsModerate`.
  - `ListingService(IListingRepository, ICategoryRepository, ICurrentUserService)`.
  - `CatalogAppFixture.CreateAuthenticatedClient(string userId = LocalTestUserId, Guid? profileId = null, params string[] permissions)`, building `LocalTest <userId>[;profile_id=<guid>][;permissions=a,b]`.

- [ ] **Step 1: Write the failing unit tests** (`ListingServiceTests`, `CreateService(FakeCurrentUserService user)` helper)
- `CreateListingAsync_sets_owner_from_profile_id_claim`: user with `ProfileId = g` → `IsSuccess`, `Value.OwnerId == g`, the stored listing's `OwnerGuid == g`.
- `CreateListingAsync_fails_with_forbidden_when_token_has_no_profile_id`: `ProfileId = null` → `!IsSuccess`, `Error.Code == ErrorCode.Forbidden`, message `"Your account has no profile id yet. Sign out and sign in again."`, repository has no listings.

- [ ] **Step 2: Run them to verify they fail**

Run: `dotnet test Tests/Catalog/MC.Catalog.UnitTests`
Expected: build error (`ListingService` constructor, `CreateListingRequest` still has `OwnerGuid`).

- [ ] **Step 3: Implement** `Permissions`, the guard at the top of `CreateListingAsync` (before the existing `try`), `OwnerGuid = profileId`, the request change, `[Authorize(Policy = Permissions.CategoriesWrite)]` on `CreateCategory`, `[Authorize(Policy = Permissions.ListingsWrite)]` on `CreateListing`, and `Program.cs`.

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `dotnet test Tests/Catalog/MC.Catalog.UnitTests`
Expected: PASS.

- [ ] **Step 5: Write the failing integration tests**

`CategoriesControllerTests` (new, `[Collection(CatalogAppCollection.Name)]`):
- `Create_category_without_categories_write_returns_403` (authenticated, permissions `listings:write`)
- `Create_category_with_categories_write_returns_200`

`ListingsControllerTests`:
- `Create_listing_without_listings_write_returns_403` (authenticated, profile id set, no permissions)
- `Create_listing_without_profile_id_returns_403` (permissions `listings:write`, no profile id)
- `Create_listing_sets_owner_from_token`: profile id `g`, `listings:write` → 200 and `GET /Listings/{id}` returns `ownerId == g`.
- Update the existing tests: category creation uses a client with `categories:write`; listing creation uses a client with `listings:write` and a profile id. `Search_by_owner_returns_only_that_owners_listings` creates A's and B's listings with two clients carrying profile ids `ownerA` and `ownerB`. Remove `ownerGuid` from the request bodies (`NewOwnedListing` collapses into `NewListing`).

- [ ] **Step 6: Run integration tests**

Run: `dotnet test Tests/Catalog/MC.Catalog.IntegrationTests` (Docker must be running)
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add Services/Catalog Tests/Catalog
git commit -m "feat(catalog): permission-protected writes and listing owner from the token"
```

### Task 3: Profiles — Auth0 role and profile id sync, finished account-type endpoint

**Files:**
- Modify: `Services/Profiles/MC.Profiles.Application/Interfaces/Services/IIdentityService.cs`
- Modify: `Services/Profiles/MC.Profiles.Infrastructure/Services/Auth0ManagementIdentityService.cs`
- Modify: `Services/Profiles/MC.Profiles.Infrastructure/Services/NoOpIdentityService.cs`
- Modify: `Services/Profiles/MC.Profiles.Infrastructure/Options/Auth0ManagementOptions.cs` and its binding in `Services/Profiles/MC.Profiles.Infrastructure/ServiceCollectionExtension.cs`
- Modify: `Services/Profiles/MC.Profiles.Application/Services/ProfileService.cs`
- Create: `Services/Profiles/MC.Profiles.Application/Validators/Requests/ClarifyAccountTypeValidator.cs`
- Modify: `Services/Profiles/MC.Profiles.API/Controllers/ProfilesController.cs` (remove `// TODO`), `Services/Profiles/MC.Profiles.Application/Requests/ClarifyAccountTypeRequest.cs` (remove `// TODO` if present)
- Modify: `Aspire/MC.Aspire.AppHost/AppHost.cs`, `Aspire/MC.Aspire.AppHost/Parameters/Auth0ManagementParameters.cs`, `Aspire/MC.Aspire.AppHost/ServiceParameterExtension.cs`
- Create: `Tests/Profiles/MC.Profiles.UnitTests/Fakes/FakeIdentityService.cs`
- Test: `Tests/Profiles/MC.Profiles.UnitTests/Application/ProfileServiceTests.cs`, `Tests/Profiles/MC.Profiles.UnitTests/Application/ClarifyAccountTypeValidatorTests.cs`, `Tests/Profiles/MC.Profiles.IntegrationTests/Api/ProfilesControllerTests.cs`

**Interfaces:**
- Consumes: `ICurrentUserService.ProfileId` (Task 1).
- Produces:
  ```csharp
  public interface IIdentityService
  {
      Task<Result> SetProfileIdAsync(string externalUserId, Guid profileId, CancellationToken ct);
      Task<Result> GrantSellerAsync(string externalUserId, CancellationToken ct);
      Task<Result> RevokeSellerAsync(string externalUserId, CancellationToken ct);
      Task SetNameAsync(string externalUserId, string name, CancellationToken ct);
  }
  ```
  - `Auth0ManagementIdentityService`: a non-success Management API response returns `Result.Failure(new Error(ErrorCode.InternalServerError, "The identity provider rejected the account update. Try again."))`; missing configuration still throws `InvalidOperationException`. Calls:
    - `SetProfileIdAsync`: `PATCH /api/v2/users/{id}` body `{ "app_metadata": { "profile_id": "<guid>" } }`
    - `GrantSellerAsync`: `POST /api/v2/users/{id}/roles` body `{ "roles": ["<SellerRoleId>"] }`
    - `RevokeSellerAsync`: `DELETE /api/v2/users/{id}/roles` with the same body
    - One private `SendManagementRequestAsync(HttpMethod, string path, object body, CancellationToken ct) -> Task<Result>` replaces the duplicated token-and-send code; `GrantSellerAsync`, `RevokeSellerAsync` additionally require a non-empty `SellerRoleId`.
  - `Auth0ManagementOptions.SellerRoleId` bound from `Auth0:Management:SellerRoleId`.
  - `NoOpIdentityService`: the three `Result` methods return `Result.Success()`.
  - `ProfileService(IProfileRepository, ICurrentUserService, IIdentityService)`.
  - AppHost parameter `Auth0-SellerRoleId` (not secret), passed as `Auth0:Management:SellerRoleId` through `Auth0ManagementParameters(ClientId, ClientSecret, SellerRoleId)`.

Behaviour (the decisions the tests pin):
- `GetAndEnsureCurrentUserProfile`, new user: build the profile, call `SetProfileIdAsync(sub, profile.Id)`; on failure return that error and do not save; on success save as today.
- Same method, existing profile: if `currentUser.ProfileId != profile.Id`, call `SetProfileIdAsync`; on failure return the error. If equal, no Auth0 call.
- `ClarifyAccountType`: guards (unauthenticated → 401, no profile → 404, `Enum.TryParse(ignoreCase)` failing or not a defined value → 400 `"Unknown account type."`). New type not `Basic` → `GrantSellerAsync` (always, even if unchanged: this is how pre-existing accounts are repaired). New type `Basic` and old type not `Basic` → `RevokeSellerAsync`. `Basic` → `Basic`: no Auth0 call. Any Auth0 failure → return it, account type unchanged, no save.
- `ClarifyAccountTypeValidator`: `AccountType` not empty and parses (ignore case) to a defined `AccountType`; message `"Account type must be Basic, Individual or Business."`.

- [ ] **Step 1: Write the failing unit tests**

`FakeIdentityService`: records calls as `List<string>` entries (`"profile-id:<sub>:<guid>"`, `"grant:<sub>"`, `"revoke:<sub>"`) and has `Result? FailWith` returned instead of success when set.

`ProfileServiceTests` (update the constructor wiring; existing tests keep passing):
- `GetAndEnsureCurrentUserProfile_writes_profile_id_before_saving_new_profile` → one `profile-id` call with the new profile's id; `SaveCalls == 1`.
- `GetAndEnsureCurrentUserProfile_does_not_save_when_identity_provider_fails` → failure code `InternalServerError`; repository empty; `SaveCalls == 0`.
- `GetAndEnsureCurrentUserProfile_writes_profile_id_for_existing_profile_when_token_lacks_it` (`_currentUser.ProfileId = null`) → one `profile-id` call.
- `GetAndEnsureCurrentUserProfile_skips_identity_provider_when_token_has_profile_id` (`_currentUser.ProfileId = profile.Id`) → no calls.
- `ClarifyAccountType_grants_seller_for_individual_and_business` (theory: `"Individual"`, `"BUSINESS"`) → `grant` call, type saved.
- `ClarifyAccountType_grants_seller_again_when_type_unchanged` (profile already `Business`) → `grant` call.
- `ClarifyAccountType_revokes_seller_when_switching_to_basic` (from `Individual`) → `revoke` call, type `Basic`.
- `ClarifyAccountType_makes_no_identity_call_for_basic_to_basic`
- `ClarifyAccountType_keeps_account_type_when_identity_provider_fails` → failure, type still `Basic`, `SaveCalls == 0`.
- `ClarifyAccountType_rejects_unknown_type` (`"Seller"`) → `ValidationFailed`, `"Unknown account type."`, no calls.

`ClarifyAccountTypeValidatorTests`: `Validate_accepts_known_types_ignoring_case` (`"basic"`, `"Individual"`, `"BUSINESS"`), `Validate_rejects_empty_and_unknown_types` (`""`, `"Seller"`, `"3"`).

- [ ] **Step 2: Run them to verify they fail**

Run: `dotnet test Tests/Profiles/MC.Profiles.UnitTests`
Expected: build errors (new `IIdentityService` members, `ProfileService` constructor, validator).

- [ ] **Step 3: Implement** the interface, `NoOpIdentityService`, `Auth0ManagementIdentityService` (remove the `is_seller` body), options and binding, `ProfileService`, validator, TODO removals, AppHost parameter.

- [ ] **Step 4: Run unit tests to verify they pass**

Run: `dotnet test Tests/Profiles/MC.Profiles.UnitTests`
Expected: PASS.

- [ ] **Step 5: Add integration tests** in `ProfilesControllerTests`:
- `Clarify_account_type_with_unknown_type_returns_400` (`{ accountType = "Seller" }`).
- `Clarify_account_type_to_basic_returns_200_and_is_not_seller` (after switching to `Individual` first).

- [ ] **Step 6: Run integration tests and build the AppHost**

Run: `dotnet test Tests/Profiles/MC.Profiles.IntegrationTests && dotnet build Aspire/MC.Aspire.AppHost`
Expected: PASS; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add Services/Profiles Aspire Tests/Profiles
git commit -m "feat(profiles): sync Auth0 seller role and profile id with the profile"
```

### Task 4: Client — fresh tokens and "Seller account" in Settings

**Files:**
- Create: `Clients/mc.market.reactwebapp/src/shared/lib/readJwtClaim.ts` (+ export from `shared/lib/index.ts`)
- Test: `Clients/mc.market.reactwebapp/src/shared/lib/__tests__/readJwtClaim.test.ts`
- Create: `Clients/mc.market.reactwebapp/src/entities/session/model/actions.ts` (context + `useSessionActions`), export from `entities/session/index.ts`
- Modify: `Clients/mc.market.reactwebapp/src/app/auth/SessionProvider.tsx`
- Modify: `Clients/mc.market.reactwebapp/src/entities/profile/api/profiles.ts`, `entities/profile/model/types.ts`, `entities/profile/index.ts`
- Test: `Clients/mc.market.reactwebapp/src/entities/profile/api/__tests__/profiles.test.ts`
- Create: `Clients/mc.market.reactwebapp/src/features/account-type/{index.ts, model/accountTypeOptions.ts, model/useChangeAccountType.ts, ui/AccountTypeSection.tsx}`
- Test: `Clients/mc.market.reactwebapp/src/features/account-type/model/__tests__/accountTypeOptions.test.ts`
- Modify: `Clients/mc.market.reactwebapp/src/pages/settings/ui/SettingsPage.tsx`

**Interfaces:**
- Consumes: `POST /api/profiles/me/clarify-account-type` body `{ accountType }` (Task 3); claim `https://marketcustoms/profile_id`.
- Produces:
  - `readJwtClaim(token: string, claim: string): unknown` — decodes the base64url payload; returns `undefined` for a malformed token or a missing claim. No signature check (the token is only inspected, never trusted).
  - `PROFILE_ID_CLAIM = "https://marketcustoms/profile_id"` exported from `entities/session`.
  - `interface SessionActions { getAccessToken(): Promise<string>; reloadSession(): void }` and `useSessionActions(): SessionActions` (throws outside the provider) from `entities/session`.
  - `type AccountType = "Basic" | "Individual" | "Business"` and `clarifyAccountType(accessToken: string, accountType: AccountType, signal?: AbortSignal): Promise<void>` from `entities/profile`.
  - `accountTypeOptions: { value: AccountType; label: string; description: string }[]` and `isSellerAccountType(type: string | null): boolean`.

Behaviour:
- `SessionProvider`: after `ensureCurrentUserMetadata` succeeds, if `readJwtClaim(token, PROFILE_ID_CLAIM) !== metadata.id`, call `getAccessTokenSilently({ cacheMode: "off" })` once (this picks up a just-written profile id). `reloadSession()` forces the next run of the effect to start with `getAccessTokenSilently({ cacheMode: "off" })` and re-fetch the metadata (use a reload counter in state plus a "force" ref). `getAccessToken()` is `getAccessTokenSilently()`.
- `AccountTypeSection` (Settings → Account, under the verification notice): heading "Seller account", three radio options with the copy below, a "Save" button disabled while unchanged or saving, an inline error `"Could not update your account type. Try again."` on failure, and on success calls `reloadSession()`.
  - Basic — "Not selling yet" / "Browse and buy. Choose a seller type to start listing."
  - Individual — "Private seller" / "You sell as a private person."
  - Business — "Business seller" / "You sell as a company."
- `useChangeAccountType()` uses TanStack Query `useMutation`, gets the token from `useSessionActions().getAccessToken()`.

- [ ] **Step 1: Write the failing tests**
- `readJwtClaim.test.ts`: `returns_claim_from_payload` (token built in the test as `header.` + base64url(JSON) + `.sig`, including a `-`/`_` character case), `returns_undefined_for_malformed_token` (`"abc"`, `"a.b"` with non-JSON payload), `returns_undefined_for_missing_claim`.
- `profiles.test.ts`: `clarifyAccountType_posts_account_type_with_bearer_token` (stub `fetch` with `vi.stubGlobal`, assert URL `/api/profiles/me/clarify-account-type`, method `POST`, header `Authorization: Bearer t`, body `{"accountType":"Business"}`), `clarifyAccountType_throws_on_error_response` (status 400).
- `accountTypeOptions.test.ts`: options are exactly `Basic`, `Individual`, `Business` in that order; `isSellerAccountType` true for `Individual`/`Business`, false for `Basic` and `null`.

- [ ] **Step 2: Run them to verify they fail**

Run: `cd Clients/mc.market.reactwebapp && npm run test`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement** the files above.

- [ ] **Step 4: Run all client checks**

Run: `cd Clients/mc.market.reactwebapp && npm run validate && npm run test && npm run build`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add Clients/mc.market.reactwebapp/src
git commit -m "feat(client): seller account type in settings and token refresh"
```

### Task 5: Auth0 setup, ADR and docs

**Files:**
- Create: `infra/auth0/actions/add-profile-id-claim.js`
- Create: `infra/auth0/README.md`
- Create: `docs/adr/0003-auth0-roles-and-permissions.md`; modify the index in `docs/adr/README.md`
- Modify: `README.md` ("Configure Auth0": new `Auth0-SellerRoleId` parameter, link to `infra/auth0/README.md`)
- Modify: `STRUCTURE.md` (add `infra/auth0/`)
- Modify: `docs/development_plan/phases/phase-01-seller-catalog.md` (the permissions open decision → settled, link ADR 0003), `docs/development_plan/ROADMAP.md` (Phase 1 status `In progress`)

**Content that is fixed:**
- Action:
  ```js
  exports.onExecutePostLogin = async (event, api) => {
    const profileId = event.user.app_metadata?.profile_id;
    if (profileId) {
      api.accessToken.setCustomClaim("https://marketcustoms/profile_id", profileId);
    }
  };
  ```
- `infra/auth0/README.md` steps, in order: create permissions `listings:write`, `listings:moderate`, `categories:write` on the API; turn on "Enable RBAC" and "Add Permissions in the Access Token"; create role `seller` (`listings:write`) and role `admin` (all permissions); copy the `seller` role id into `Parameters:Auth0-SellerRoleId`; grant the M2M application the Management API scopes `update:users`, `create:role_members`, `delete:role_members`; create a post-login Action from `actions/add-profile-id-claim.js` and add it to the Login flow; assign `admin` to your user by hand.
- ADR 0003: status Accepted, date 2026-11-18; options: (1) Auth0 roles and permissions plus a profile-id claim, (2) Catalog asks Profiles for the account type; decision (1); consequences: manual tenant setup, token refresh after account-type change, `is_seller` removed, admin = all permissions.

- [ ] **Step 1: Write the files above.**
- [ ] **Step 2: Manual check against a real tenant** (you, not CI), after following `infra/auth0/README.md`:
  - [ ] sign in as a new user → the second access token (jwt.io) has `https://marketcustoms/profile_id`;
  - [ ] Settings → choose "Private seller" → the next token has `permissions: ["listings:write"]`;
  - [ ] `POST /api/categories` as that user → 403; as the admin → 200;
  - [ ] choose "Not selling yet" → the seller role is gone in the Auth0 dashboard.
- [ ] **Step 3: Commit**

```bash
git add infra docs README.md STRUCTURE.md
git commit -m "docs: Auth0 roles setup, ADR 0003 and Phase 1 status"
```

- [ ] **Step 4: Open the PR** into `main` (description ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`), wait for `ci-ok`.
