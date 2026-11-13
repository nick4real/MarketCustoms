# Real Sellers and Profile Listings Implementation Plan

> **For agentic workers:** Execution follows the task-storm pipeline: one coder per task (`dotnet-coder` / `react-coder`), then the matching reviewer. Reviewers work from the working-tree `git diff`. **No commits.** Each task ends by reporting its changed files. Steps use checkbox (`- [ ]`) syntax.

**Goal:**
- The listing details seller card shows the real owner and links to `/profile/:id`.
- Profile pages, your own and other users', show the user's real profile data and real listings.

**Architecture:**
- **Backend:** two additive changes, an optional `OwnerId` filter on Catalog's listing search and `PictureUrl` on the Profiles public profile response.
- **Frontend:**
  - `entities/profile` gains a public-profile API and hook; `entities/listing` gains an `ownerId` search param and an owner-listings hook.
  - A public `profile/:profileId` route is added. `ProfilePage` and the listing seller card consume the new hooks.

**Tech Stack:**
- Backend: .NET 10, ASP.NET Core, MongoDB driver, xUnit with Aspire testing.
- Frontend: React, TypeScript, React Router, TanStack Query, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-real-sellers-and-profile-listings-design.md`

## Global Constraints

- No commits. Don't touch the uncommitted Profiles migration work (`MC.Profiles.Infrastructure.csproj`, `ProfilesDatabaseSeeder.cs`, `Migrations/`).
- No new endpoints and no schema changes.
- FSD rules from `Clients/mc.market.reactwebapp/README.md`:
  - Import direction is `app → pages → widgets → features → entities → shared`.
  - Other slices import a slice only through its `index.ts`.
  - Inside a slice, imports are relative.
- Owner listings page size: `12`.
- Copy:
  - `"Profile not found"`
  - `"Back to Browse"`
  - `"No active listings"`
  - `"No bio yet."`
  - `"Loading..."`
  - `"‹ Prev"` / `"Next ›"`
- Leave these as they are today: profile stats, Reviews tab, cover image, Message/Follow buttons, and the browse/home/related cards.
- C# follows `~/.claude/rules/csharp.md`; where the project already does something differently, follow the project.

## Review Focus

1. **Opening your own profile by URL** (`/profile/<your profileId>`) shows the owner header, with the verified/unverified badge and the email. → `resolveProfileTarget` test, Task 5.
2. **Signed in on `/profile` before session metadata has loaded** (`account.profileId === null`): show the loading state. Don't show "not found", and don't fire a request with an empty ID. → `resolveProfileTarget` test, Task 5.
3. **Navigating from `/profile/a` to `/profile/b`** resets the tab and the listings page to their defaults. → Task 5, Step 4: key the profile view by `profileId`.
4. **A malformed or unknown ID** (`/profile/not-a-guid`): the `{id:guid}` constraint returns 404, and the page shows "Profile not found". It doesn't show the generic error. → Task 5, manual check.
5. **`ownerId` that is whitespace only or padded** is trimmed or dropped, never sent as `"  "`. → `listingSearchBody` test, Task 4.

---

### Task 1: Catalog owner filter (dotnet-coder, TDD)

**Files:**
- Modify: `Services/Catalog/MC.Catalog.Application/Models/ListingParams.cs`
- Modify: `Services/Catalog/MC.Catalog.Application/Validators/ListingParamsValidator.cs`
- Modify: `Services/Catalog/MC.Catalog.Infrastructure/Persistence/Repositories/ListingRepository.cs` (`GetListingsCatalogViewAsync`, filter block)
- Test: `Tests/Catalog/MC.Catalog.IntegrationTests/Api/ListingsControllerTests.cs`

**Interfaces:**
- Produces: `POST /listings` body accepts `"ownerId": "<guid>"`. `ListingParams` becomes `(uint? CategoryId, string? Title, string? Sort, Condition? Condition, List<Tuple<string,string>>? Parameters, Guid? OwnerId)`.

- [ ] **Step 1: Write the failing test** `Search_by_owner_returns_only_that_owners_listings`. Add it to `ListingsControllerTests`.
  1. Create a category, the same way the existing persist test does.
  2. With the authenticated client, create one listing for each of `ownerA = Guid.NewGuid()` and `ownerB = Guid.NewGuid()`, through `/Listings/create`. Use a new helper `NewOwnedListing(uint categoryId, string title, Guid ownerGuid)`. Its body sends `ownerGuid`, `title`, `description`, `categoryId`, `location = new { country = "Testland", region = "R", city = "C", district = (string?)null, latitude = 0m, longitude = 0m }`, `price = 9.99m`, `stockQuantity = 1`, and empty `imageLinks`/`tags`/`parameters`.
  3. Call `POST /Listings?pageSize=50` with `{ ownerId = ownerA }` and read it as `ListingPage`. Assert there is a single item, with ownerA's title.
  4. Call `POST /Listings` with `{ ownerId = Guid.NewGuid() }` and assert that `Items` is empty.
  5. Call `POST /Listings` with `{ ownerId = Guid.Empty }` and assert 400.
- [ ] **Step 2: Run the test to verify it fails.**
  Run: `dotnet test Tests/Catalog/MC.Catalog.IntegrationTests --filter "FullyQualifiedName~Search_by_owner"` (needs Docker).
  Expected: FAIL. The owner filter is ignored, so both listings come back.
- [ ] **Step 3: Implement the filter.**
  - Add `Guid? OwnerId` as the last parameter of `ListingParams`.
  - In the repository's `if (listingParams != null)` block, add `filter &= filterBuilder.Eq(p => p.OwnerGuid, listingParams.OwnerId.Value)` when it has a value.
  - Validator: `RuleFor(p => p.OwnerId).NotEqual(Guid.Empty).When(p => p.OwnerId.HasValue)`.
  - Fix any positional `new ListingParams(...)` call sites, including the out-of-date unit-test fakes only if they already compile.
- [ ] **Step 4: Run the test to verify it passes.**
  Run: same filter. Expected: PASS.
  Then run `dotnet build MarketCustoms.slnx`. Expected: 0 errors.
- [ ] **Step 5: Report the changed files.** No commit.

### Task 2: Profiles public picture (dotnet-coder, no TDD: response mapping)

**Files:**
- Modify: `Services/Profiles/MC.Profiles.Application/Responses/PublicProfileResponse.cs`
- Modify: `Services/Profiles/MC.Profiles.Application/Services/ProfileService.cs` (`GetProfileInfo`)

**Interfaces:**
- Produces: `GET /profiles/{id}` returns `{ id, displayName, pictureUrl: string|null, bio, isSeller }`. In C#: `PublicProfileResponse(Guid Id, string DisplayName, string? PictureUrl, string? Bio, bool IsSeller)`.

- [ ] **Step 1:** Add `string? PictureUrl` after `DisplayName`, and map `PictureUrl: profile.PictureUrl` in `GetProfileInfo`.
- [ ] **Step 2: Verify.** Run `dotnet build MarketCustoms.slnx`. Expected: 0 errors in the Profiles projects. Unit-test projects that were already failing to compile are reported, not fixed.
- [ ] **Step 3: Report the changed files.**

### Task 3: Frontend public profile entity and route (react-coder, TDD for the mapper)

**Files:**
- Modify: `src/entities/profile/model/types.ts`
- Modify: `src/entities/profile/api/profiles.ts`
- Create: `src/entities/profile/api/usePublicProfileQuery.ts`
- Modify: `src/entities/profile/index.ts`
- Modify: `src/shared/config/routes.ts` (+ `src/shared/config/__tests__/routes.test.ts`)
- Test: `src/entities/profile/api/__tests__/profiles.test.ts`

(All paths are relative to `Clients/mc.market.reactwebapp`.)

**Interfaces:**
- Consumes: the Task 2 response shape.
- Produces:
  - `interface PublicProfile { id: string; displayName: string; bio: string | null; pictureUrl: string | null; isSeller: boolean }`
  - `mapPublicProfile(body: unknown): PublicProfile`
  - `getPublicProfile(id: string, signal?: AbortSignal): Promise<PublicProfile>`
  - `usePublicProfileQuery(id: string | undefined)`: TanStack `useQuery`, key `["profiles", "public", id]`, `enabled: Boolean(id)`.
  - `index.ts` exports `PublicProfile`, `getPublicProfile` and `usePublicProfileQuery`.
  - `routes.userProfile(id: string): string`, which returns `` `/profile/${encodeURIComponent(id)}` ``.

- [ ] **Step 1: Write the failing tests.** In `describe("mapPublicProfile")`:
  - It maps `{ id: "2222…", displayName: "Ada L.", pictureUrl: "https://cdn.example/ada.png", bio: "Hi", isSeller: true }` to the identical object.
  - Missing `pictureUrl` and `bio` become `null`.
  - It throws `/Invalid public profile/` when `id` is missing, when `displayName` is missing, and when `isSeller` is not a boolean.

  In `routes.test.ts`:
  - `routes.userProfile("a b")` returns `"/profile/a%20b"`.
- [ ] **Step 2: Run the tests to verify they fail.**
  Run: `npx vitest run src/entities/profile src/shared/config`. Expected: FAIL, because the functions are undefined.
- [ ] **Step 3: Implement.**
  - The mapper uses `readStringNonEmpty` and `readBoolean` from `@/shared/lib`, and the error message `"Invalid public profile"`.
  - `getPublicProfile` fetches `` `/api/profiles/${encodeURIComponent(id)}` `` and goes through `readResponse(response, "Public profile request")`, so a 404 surfaces as an `HttpError` (works with `isNotFoundError`).
  - The hook follows the `useListingQuery` pattern.
- [ ] **Step 4: Run the tests to verify they pass.** Same command. Expected: PASS.
- [ ] **Step 5: Report the changed files.**

### Task 4: Frontend owner listings (react-coder, TDD for `listingSearchBody`)

**Files:**
- Modify: `src/entities/listing/model/types.ts` (`ListingQueryParams`)
- Modify: `src/entities/listing/lib/listingSearchBody.ts`
- Modify: `src/entities/listing/api/listings.ts` (`getListings` input type)
- Create: `src/entities/listing/api/useOwnerListingsQuery.ts`
- Modify: `src/entities/listing/index.ts`
- Test: `src/entities/listing/lib/__tests__/listingSearchBody.test.ts`

**Interfaces:**
- Consumes: the Task 1 `ownerId` body field.
- Produces:
  - `ListingQueryParams.ownerId?: string`, and the `getListings` input accepts `ownerId?: string`.
  - `useOwnerListingsQuery(ownerId: string | undefined, pageIndex: number)` returns a `useQuery` of `ListingPaginatedResponse`, with key `["listings", "owner", ownerId, pageIndex]`, `enabled: Boolean(ownerId)` and `placeholderData: keepPreviousData`. It calls `getListings({ ownerId, pageIndex, pageSize: OWNER_LISTINGS_PAGE_SIZE })`.
  - `OWNER_LISTINGS_PAGE_SIZE = 12`, defined in the hook file.
  - `index.ts` exports `useOwnerListingsQuery`, `ListingView` (type) and `ListingPaginatedResponse` (type) if they aren't exported already.

- [ ] **Step 1: Write the failing tests.**
  - `listingSearchBody({ ownerId: "  abc " })` returns `{ ownerId: "abc" }`.
  - `listingSearchBody({ ownerId: "   " })` returns `undefined`.
  - `listingSearchBody({ ownerId: "abc", sort: "priceAsc" })` returns `{ ownerId: "abc", sort: "priceAsc" }`.
- [ ] **Step 2: Run the tests to verify they fail.**
  Run: `npx vitest run src/entities/listing`. Expected: FAIL on the ownerId cases.
- [ ] **Step 3: Implement.**
  - Trim `ownerId` and set it when it's non-empty.
  - Include `body.ownerId !== undefined` in the "has a body" check.
  - Add the hook.
- [ ] **Step 4: Run the tests to verify they pass.** Same command. Expected: PASS.
- [ ] **Step 5: Report the changed files.**

### Task 5: Routing, ProfilePage and seller card (react-coder; TDD only for `resolveProfileTarget`)

Depends on Tasks 3 and 4.

**Files:**
- Modify: `src/app/routing/router.tsx`
- Create: `src/pages/profile/lib/resolveProfileTarget.ts`
- Test: `src/pages/profile/lib/__tests__/resolveProfileTarget.test.ts`
- Create: `src/pages/profile/ui/ProfileListings.tsx`
- Modify: `src/pages/profile/ui/ProfilePage.tsx`
- Modify: `src/pages/listing-details/ui/ListingDetailsPage.tsx` (seller card)

**Interfaces:**
- Consumes:
  - `usePublicProfileQuery` and `PublicProfile` from `@/entities/profile`.
  - `useOwnerListingsQuery` and `ListingCard` from `@/entities/listing`.
  - `routes.userProfile`.
  - `isNotFoundError` from `@/shared/api`.
- Produces: `resolveProfileTarget(paramId: string | undefined, accountProfileId: string | null | undefined): { profileId: string | null; isOwn: boolean }`.

- [ ] **Step 1: Write the failing tests** for `resolveProfileTarget`.
  - `("p1", "p1")` → `{ profileId: "p1", isOwn: true }` (Review Focus 1).
  - `("p2", "p1")` → `{ profileId: "p2", isOwn: false }`.
  - `("p2", null)` → `{ profileId: "p2", isOwn: false }` (guest).
  - `(undefined, "p1")` → `{ profileId: "p1", isOwn: true }`.
  - `(undefined, null)` → `{ profileId: null, isOwn: false }` (Review Focus 2).
- [ ] **Step 2: Run the tests to verify they fail.**
  Run: `npx vitest run src/pages/profile`. Expected: FAIL, because the module doesn't exist.
- [ ] **Step 3: Implement `resolveProfileTarget`, then run the tests.** Expected: PASS.
- [ ] **Step 4: Wire up the pages.**
  - **Router:** add `{ path: "profile/:profileId", Component: ProfilePage }` as a sibling of `listings/:listingId`, outside `AccountGate`. `profile` stays inside `AccountGate`.
  - **`ProfilePage`:**
    - Resolve the target from `useParams().profileId` and `account?.profileId`.
    - `profileId === null`: render `StatusMessage size="page" message="Loading..."`.
    - Otherwise render an inner `ProfileView` with `key={profileId}`. The key resets the tab and page state (Review Focus 3).
  - **`ProfileView`:**
    - `usePublicProfileQuery(profileId)`.
    - `isNotFoundError`: show "Profile not found" with a `ButtonLink` to `routes.browse` labelled "Back to Browse", the same pattern as `ListingDetailsPage`.
    - Pending: "Loading...". Error: `symbol="Whoops!" message="Error loading profile"`.
    - Header:
      - Name: `profile.displayName`.
      - Avatar: `src={profile.pictureUrl ?? (isOwn ? account?.photoUrl : null)}` with initials from `getInitials(profile.displayName)`.
      - The verified/unverified badge, the "Verify email" link and the email handle render only when `isOwn`.
    - About tab: `profile.bio ?? "No bio yet."`. Delete the hard-coded Tokyo text.
    - Delete the mock `listings` array. Keep the stats, reviews, cover and buttons as they are.
  - **`ProfileListings({ ownerId })`:**
    - `const [page, setPage] = useState(1)`, then `useOwnerListingsQuery(ownerId, page)`.
    - Pending: inline "Loading...". Error: inline "Couldn't load listings". Empty: inline "No active listings".
    - Otherwise: a `ListingCard` grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), plus "‹ Prev"/"Next ›" outline buttons when `totalPages > 1`. The buttons are disabled by `!hasPreviousPage` / `!hasNextPage` / `isPlaceholderData`, with a `{pageIndex} / {totalPages}` label, matching the `SearchPagination` markup.
  - **`ListingDetailsPage` seller card:**
    - `const sellerQuery = usePublicProfileQuery(listing.ownerId)`. Call it before the early returns, using `listingQuery.data?.ownerId`, so hook order stays stable.
    - Name: `sellerQuery.data?.displayName ?? "—"`.
    - Avatar: `src={sellerQuery.data?.pictureUrl}` with `initials={sellerQuery.data ? getInitials(sellerQuery.data.displayName) : "—"}`.
    - Link to `routes.userProfile(listing.ownerId)`.
- [ ] **Step 5: Verify.**
  - Run `npm run lint && npm run test && npm run build` in `Clients/mc.market.reactwebapp`. Expected: all green.
  - Manual check with Aspire running:
    - The seller card on a seeded listing shows the seller's name and links to their profile.
    - That profile lists their listings.
    - `/profile/not-a-guid` shows "Profile not found" (Review Focus 4).
    - Your own `/profile` shows the badge and email.
- [ ] **Step 6: Report the changed files.**

## Execution order

- Tasks 1, 2, 3 and 4 are independent and run in parallel.
- Task 5 runs after Tasks 3 and 4 have both been reviewed.
- Final verification uses `test-runner`:
  - Webapp: lint, test, build.
  - Backend: `dotnet build MarketCustoms.slnx` and the Catalog integration tests.
  - Unit-test projects: status reported.
