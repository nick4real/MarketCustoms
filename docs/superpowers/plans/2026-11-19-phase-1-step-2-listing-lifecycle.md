# Phase 1, step 2: Listing lifecycle (implementation plan)

> **For agentic workers:** Execute task by task with `superpowers:executing-plans`, or dispatch one coder per task (`dotnet-coder` for Tasks 1–2, `react-coder` for Tasks 3–4) and a matching reviewer after each. Steps use checkbox (`- [ ]`) syntax for tracking. **Make no commits.** At the end of each task, report the changed files.

**Goal:** listings get a `Draft` / `Active` / `Disabled` status. Owners and moderators can update, publish, disable, activate and delete drafts, and list their own listings. Browse and search show only `Active` listings. The client gets "My listings" and a create/edit form (no images yet).

**Architecture:**
- The status and its transitions live on the `Listing` domain entity.
- `ListingService` loads the listing, checks visibility and ownership, applies the transition, then persists through `IListingRepository`. Mongo holds the document; SQL Server holds the location row.
- The client calls the new endpoints from `entities/listing` and builds its pages from the `listing-editor` and `listing-status` features.

**Tech Stack:** .NET 10, MongoDB driver, EF Core (SQL Server), FluentValidation, xUnit v3 + Aspire.Hosting.Testing, React + TypeScript, TanStack Query, react-router, Vitest.

**Spec:** [`docs/superpowers/specs/2026-11-18-phase-1-seller-catalog-design.md`](../specs/2026-11-18-phase-1-seller-catalog-design.md): decision 2, the decision 3 rows other than images and categories, decision 6 without images, and "Order of work" step 2. Also [ADR 0004](../../adr/0004-listing-lifecycle.md).

## Global Constraints

- **Statuses:** exactly `Draft`, `Active`, `Disabled`, serialized as strings. "Sold out" is never stored: it is an `Active` listing with `StockQuantity = 0`.
- **Transitions:** `Draft → Active` (publish), `Active → Disabled` (disable), `Disabled → Active` (activate). Anything else returns 409. A disabled listing never goes back to `Draft`.
- **Delete:** only a `Draft` can be deleted (hard delete of the Mongo document and its SQL location row). Deleting a non-draft returns 409.
- **Visibility:** browse, search and `GET /listings` return only `Active` listings, sold-out ones included. A `Draft` or `Disabled` listing returns 404 to anyone who is neither its owner nor a holder of `listings:moderate`.
- **Writes:** update, the status changes and delete are allowed for the owner (`OwnerGuid == ProfileId`) or a holder of `listings:moderate`.
  - Anyone else gets 404 if the listing is hidden from them, otherwise 403.
  - These endpoints need `[Authorize]` only, with no permission policy, so a moderator without `listings:write` can act.
- **Who can create:** `POST /listings/create` (`listings:write`) now creates a `Draft`. `GET /listings/mine` needs `listings:write` and a profile id.
- **Editing** is allowed in every status.
- **Old data:** existing documents have no `Status` field and must behave as `Active` everywhere.
- **Out of this step:** images stay as they are. `ImageLinks` stays in `CreateListingRequest`, and the client sends `[]` (step 3 removes it). No upload UI.
- **Permission names** come from `MC.Catalog.Application.Common.Permissions`. Never write the literal strings in code.
- **Repo rules:** no commits and no branches unless the user asks. When asked: branch `feat/phase-1-listing-lifecycle`, one PR into `main`, and `ci-ok` must pass.

## Review Focus

1. **A stranger reading or writing someone else's draft** gets 404 on `GET`, `PUT` and `publish`, never 200 or 403 (which would leak that it exists). Tests: Task 2, `Stranger_gets_404_for_someone_elses_draft` and the unit test `UpdateListingAsync_returns_not_found_for_hidden_listing_of_someone_else`.
2. **Documents written before this step**, with no `Status` field, still appear in browse and by id. Test: Task 2, `Listing_without_status_field_is_treated_as_active`.
3. **Bad update bodies** (empty title, price 0, stock −1, 21 tags) return 400 with a validation message, never 500. Tests: Task 2, `ListingContentValidatorTests` and `Update_with_invalid_body_returns_400`.
4. **The route `GET /listings/mine` must not be swallowed by `GET /listings/{listingId}`.** If it were, `"mine"` would fail the id-length check and return 400. Test: Task 2, `Mine_returns_callers_listings_in_every_status`.
5. **A moderator** (`listings:moderate`, a different profile id) can see someone else's draft, edit it and disable their active listing. Test: Task 2, `Moderator_can_edit_and_disable_someone_elses_listing`.

---

### Task 1: Domain status and persistence

**TDD:** yes, for the transition methods. The repository is glue and needs no TDD; Task 2's integration tests cover it.

**Files:**
- Create: `Services/Catalog/MC.Catalog.Domain/Enums/ListingStatus.cs`
- Modify: `Services/Catalog/MC.Catalog.Domain/Entities/Listing.cs`
- Create: `Services/Catalog/MC.Catalog.Domain/Views/OwnerListingView.cs`
- Modify: `Services/Catalog/MC.Catalog.Infrastructure/Models/ListingBson.cs`
- Modify: `Services/Catalog/MC.Catalog.Application/Interfaces/Repositories/IListingRepository.cs`
- Modify: `Services/Catalog/MC.Catalog.Infrastructure/Persistence/Repositories/ListingRepository.cs`
- Modify: `Services/Catalog/MC.Catalog.Infrastructure/Persistence/Seeding/ListingFactory.cs` and the curated `ToBson` (`Seeding/CuratedListings.cs`): set `Status = ListingStatus.Active`
- Modify: `Tests/Catalog/MC.Catalog.UnitTests/Fakes/FakeListingRepository.cs` (new members)
- Test: `Tests/Catalog/MC.Catalog.UnitTests/Domain/ListingStatusTransitionTests.cs`, `Tests/Catalog/MC.Catalog.UnitTests/Infrastructure/ListingFactoryTests.cs` (one new test)

**Interfaces:**
- Produces:
  - `[JsonConverter(typeof(JsonStringEnumConverter))] public enum ListingStatus { Draft, Active, Disabled }` in namespace `MC.Catalog.Domain.Enums`. Same style as `Condition`.
  - New members on `Listing`:
    - `ListingStatus Status { get; set; } = ListingStatus.Draft;`
    - `bool Publish()`, `bool Disable()`, `bool Activate()`. Each returns `false` and leaves the status unchanged when the transition isn't allowed.
    - `bool CanBeDeleted => Status == ListingStatus.Draft;`
  - `public record OwnerListingView(string Id, string Title, decimal Price, int StockQuantity, ListingStatus Status, string ImageLink, DateTimeOffset CreatedAt);`
  - `ListingBson`:
    - `[BsonRepresentation(BsonType.String)] public ListingStatus Status { get; set; } = ListingStatus.Active;`
    - Add the comment: "Documents written before listings had a status have no field and read as Active."
  - New `IListingRepository` members:
    - `Task UpdateListingAsync(Listing listing, CancellationToken ct);` In one `ExecuteInTransactionAsync`, it `$set`s `Title`, `Description`, `Condition`, `CategoryId`, `Price`, `StockQuantity`, `Tags`, `Parameters` and `Status` on the document. It also updates the SQL `Location` row `listing.LocationId` from `listing.Location`. It doesn't touch `OwnerGuid`, `CreatedAt` or `ImageLinks`.
    - `Task DeleteListingAsync(Listing listing, CancellationToken ct);` deletes the document and the `Location` row in one transaction.
    - `Task<PagedCollection<OwnerListingView>> GetOwnerListingsAsync(Guid ownerId, int skip, int take, CancellationToken ct);` returns every status, sorted by `CreatedAt` descending.
  - Changes to existing repository members:
    - `AddListingAsync`:
      - Inside the transaction, save the SQL context before building the BSON, so that `LocationId` is the real id. Today the document stores `0`.
      - Write `Status`.
      - After the insert, set `listing.Id` and `listing.LocationId`. Today the create response has an empty id.
    - `GetListingByIdAsync` maps `Status` and `Condition`. Today `Condition` is dropped and always reads as `New`.
  - `FakeListingRepository` implements the new members on its in-memory list. `Add` assigns a 24-character hex `Id` when it is empty.

- [ ] **Step 1: Write the failing tests** in `ListingStatusTransitionTests`:
  - `Publish_moves_draft_to_active`
  - `Publish_is_rejected_unless_draft`: a theory over `Active` and `Disabled`. Asserts it returns `false` and the status is unchanged.
  - `Disable_moves_active_to_disabled`
  - `Disable_is_rejected_unless_active`: a theory over `Draft` and `Disabled`.
  - `Activate_moves_disabled_to_active`
  - `Activate_is_rejected_unless_disabled`: a theory over `Draft` and `Active`.
  - `New_listing_is_draft_and_only_draft_can_be_deleted`
  - In `ListingFactoryTests`, add `Seeded_listings_are_active`.
- [ ] **Step 2:** Run `dotnet test Tests/Catalog/MC.Catalog.UnitTests`. Expected: build errors (`ListingStatus` and `Publish` don't exist).
- [ ] **Step 3:** Implement the members listed under Interfaces.
- [ ] **Step 4:** Run `dotnet test Tests/Catalog/MC.Catalog.UnitTests && dotnet test Tests/Catalog/MC.Catalog.IntegrationTests` (Docker running). Expected: all pass. Nothing filters on status yet, so the existing integration tests stay green.
- [ ] **Step 5:** Report the changed files.

### Task 2: Service, validation and endpoints

**TDD:** yes, for `ListingService` and the validator.

**Files:**
- Create: `Services/Catalog/MC.Catalog.Application/Requests/IListingContent.cs` and `Requests/UpdateListingRequest.cs`
- Modify: `Requests/CreateListingRequest.cs` (add `Condition`, implement `IListingContent`)
- Create: `Validators/Requests/ListingContentValidator.cs` and `Validators/Requests/UpdateListingValidator.cs`
- Modify: `Validators/Requests/CreateListingValidator.cs` (replace the TODO with `Include(new ListingContentValidator())`)
- Create: `DTOs/OwnerListingDto.cs`
- Modify: `Responses/ListingDetailedResponse.cs`, `Interfaces/Services/IListingService.cs`, `Services/ListingService.cs`
- Modify: `Services/Catalog/MC.Catalog.Infrastructure/Persistence/Repositories/ListingRepository.cs`: `GetListingsCatalogViewAsync` filters on status
- Modify: `Services/Catalog/MC.Catalog.API/Controllers/ListingsController.cs`
- Modify: `Tests/Catalog/MC.Catalog.UnitTests/Fakes/FakeListingRepository.cs` (the same visibility filter in `GetListingsCatalogViewAsync`)
- Test: `Tests/Catalog/MC.Catalog.UnitTests/Application/ListingServiceTests.cs`, `Tests/Catalog/MC.Catalog.UnitTests/Application/ListingContentValidatorTests.cs`, `Tests/Catalog/MC.Catalog.IntegrationTests/Api/ListingsControllerTests.cs`, `Tests/Catalog/MC.Catalog.IntegrationTests/Api/ListingLifecycleTests.cs`

**Interfaces:**
- Consumes: everything Task 1 produces.
- Produces:
  - `IListingContent`, the shared shape of create and update: `Title`, `Description`, `Condition`, `CategoryId`, `Location` (`LocationDto`), `Price`, `StockQuantity`, `Tags` (`List<string>`), `Parameters` (`List<ParamDto>`).
  - `public record UpdateListingRequest(string Title, string Description, Condition Condition, uint CategoryId, LocationDto Location, decimal Price, int StockQuantity, List<string> Tags, List<ParamDto> Parameters) : IListingContent;`
  - `CreateListingRequest` gains `Condition Condition` after `Description`. `ImageLinks` stays for now.
  - `ListingContentValidator : AbstractValidator<IListingContent>`. These limits are my choice; the spec doesn't fix any:

    | Field | Rule |
    | --- | --- |
    | Title | not empty, at most 200 |
    | Description | at most 5000 |
    | Condition | `IsInEnum` |
    | CategoryId | greater than 0 |
    | Location | not null |
    | Location.Country, Location.City | not empty, at most 100 |
    | Location.Region, Location.District | at most 100 |
    | Latitude | between −90 and 90 |
    | Longitude | between −180 and 180 |
    | Price | greater than 0, at most 1 000 000 |
    | StockQuantity | between 0 and 10 000 |
    | Tags | at most 20 items, each not empty and at most 50 |
    | Parameters | at most 30 items; each name and value not empty and at most 100 |

  - `ListingDetailedResponse` gains `Condition Condition` and `ListingStatus Status`, appended at the end.
  - `public record OwnerListingDto(string Id, string Title, decimal Price, int Stock, ListingStatus Status, string ImageId, DateTime CreatedAt);`
  - New `IListingService` members:
    ```csharp
    Task<Result<ListingDetailedResponse>> UpdateListingAsync(string id, UpdateListingRequest request, CancellationToken ct);
    Task<Result<ListingDetailedResponse>> PublishListingAsync(string id, CancellationToken ct);
    Task<Result<ListingDetailedResponse>> DisableListingAsync(string id, CancellationToken ct);
    Task<Result<ListingDetailedResponse>> ActivateListingAsync(string id, CancellationToken ct);
    Task<Result> DeleteListingAsync(string id, CancellationToken ct);
    Task<Result<ListingsPaginatedResponse<OwnerListingDto>>> GetMyListingsAsync(PaginationParams paginationParams, CancellationToken ct);
    ```
  - Routes on `ListingsController`. All of them are `[Authorize]` except `mine`, which also has `[Authorize(Policy = Permissions.ListingsWrite)]`:

    | Route | Response |
    | --- | --- |
    | `PUT /listings/{listingId}` | listing |
    | `DELETE /listings/{listingId}` | 200, no body (`HandleResult(Result)`) |
    | `POST /listings/{listingId}/publish` | listing |
    | `POST /listings/{listingId}/disable` | listing |
    | `POST /listings/{listingId}/activate` | listing |
    | `GET /listings/mine?pageIndex=&pageSize=` | page of `OwnerListingDto` |

Behaviour the tests pin:
- **Reading by id:** `GetDetailedListingByIdAsync` returns 404 (the existing message) when the listing isn't `Active` and the caller is neither the owner nor holds `ListingsModerate`.
- **Every write** goes through one private `Task<Result<Listing>> LoadForWriteAsync(string id, CancellationToken ct)`, which checks in this order:
  1. The id is not 24 characters: 400, `"Invalid listing ID format."`.
  2. Not found, or hidden from the caller: 404.
  3. The caller is neither the owner nor a moderator: 403, `"You can only change your own listings."`.
- **409 messages** (`ErrorCode.Conflict`):
  - publish: `"Only a draft can be published."`
  - disable: `"Only an active listing can be disabled."`
  - activate: `"Only a disabled listing can be activated."`
  - delete: `"Only a draft can be deleted. Disable a published listing instead."`
- **Update** copies every `IListingContent` field onto the loaded listing, including `Location` with its existing `LocationId`, then calls `UpdateListingAsync`. The status is unchanged.
- **Mine:** `GetMyListingsAsync` returns 403 with the create message (`"Your account has no profile id yet. Sign out and sign in again."`) when `ProfileId` is null. It builds the page like `GetListingsAsync` does.
- **Status filter** in `GetListingsCatalogViewAsync`: start from `filterBuilder.Nin(p => p.Status, [ListingStatus.Draft, ListingStatus.Disabled])` instead of `Empty`. `Nin` also matches documents without the field (Review Focus 2). Add a comment saying why it isn't `Eq(Active)`.
  - With this filter, the count always uses `CountDocumentsAsync`, so the `EstimatedDocumentCountAsync` branch goes away.
  - Remove the stray `Console.WriteLine`.

- [ ] **Step 1: Write the failing unit tests.** Add a `NewListing(Guid owner, ListingStatus status)` helper that adds a listing to the fake.
  - `ListingServiceTests`:
    - `CreateListingAsync_creates_a_draft`
    - `GetDetailedListingByIdAsync_hides_draft_from_strangers`: 404 for a stranger, success for the owner and for a moderator.
    - `UpdateListingAsync_updates_fields_and_keeps_status` (on a `Disabled` listing)
    - `UpdateListingAsync_returns_forbidden_for_active_listing_of_someone_else`: 403 with the message above.
    - `UpdateListingAsync_returns_not_found_for_hidden_listing_of_someone_else`
    - `UpdateListingAsync_allows_moderator`
    - `PublishListingAsync_publishes_draft` and `PublishListingAsync_returns_conflict_for_active` (409 with the message above)
    - `DisableListingAsync_returns_conflict_for_draft`
    - `ActivateListingAsync_activates_disabled`
    - `DeleteListingAsync_deletes_draft` (the fake is empty afterwards) and `DeleteListingAsync_returns_conflict_for_active` (the listing is still there)
    - `GetMyListingsAsync_returns_only_callers_listings_in_every_status`
    - `GetMyListingsAsync_returns_forbidden_without_profile_id`
    - `GetListingsAsync_returns_only_active_listings`
  - `ListingContentValidatorTests`:
    - `Valid_content_passes`
    - `Invalid_content_fails`: a theory over an empty title, price `0`, stock `-1`, 21 tags, an empty country, and latitude `91`.
- [ ] **Step 2:** Run `dotnet test Tests/Catalog/MC.Catalog.UnitTests`. Expected: build errors.
- [ ] **Step 3:** Implement the interfaces and behaviour above.
- [ ] **Step 4:** Run `dotnet test Tests/Catalog/MC.Catalog.UnitTests`. Expected: pass.
- [ ] **Step 5: Integration tests.**
  - Fix the existing tests in `ListingsControllerTests`. New listings are drafts, so:
    - `Create_listing_sets_owner_from_token` and `Authenticated_create_persists_listing_in_isolated_stores` read the listing back with the owner's client, not the anonymous one.
    - `Search_by_owner_returns_only_that_owners_listings` publishes both listings before searching.
    - `FindListingIdByTitle` and the `Id.Length: 24` fallback go away: assert that the create response's `id` has 24 characters.
    - `NewListing` gains `condition = "Used"`.
  - Add `ListingLifecycleTests` (`[Collection(CatalogAppCollection.Name)]`):
    - `Owner_publishes_draft_and_it_appears_in_browse`: before publishing, the anonymous `POST /Listings` with `{ title }` doesn't find it; after publishing it does.
    - `Stranger_gets_404_for_someone_elses_draft`: `GET`, `PUT` and `POST publish` all return 404.
    - `Editing_someone_elses_listing_returns_403`: the listing is active and the stranger sends a `PUT`. This is the phase's "Done when" item.
    - `Invalid_transition_returns_409`: publish an active listing.
    - `Deleting_active_listing_returns_409_and_deleting_draft_returns_200`: afterwards, `GET` by the owner returns 404.
    - `Disabled_listing_is_hidden_from_browse_and_back_after_activate`
    - `Mine_returns_callers_listings_in_every_status`: one draft, one active, one disabled. `GET /Listings/mine` returns 200 with exactly those three and their statuses.
    - `Update_with_invalid_body_returns_400`: price `0`.
    - `Moderator_can_edit_and_disable_someone_elses_listing`: the client has `listings:moderate` and another profile id. It can see the owner's draft by id, `PUT` it, publish it, then disable it.
    - `Listing_without_status_field_is_treated_as_active`:
      - Insert a raw BSON document without a `Status` field into the catalog's Mongo database. Get the connection string from `_fixture.App` with `GetConnectionStringAsync` on the Mongo resource; check the AppHost or test composition for the resource and database names.
      - It appears in the anonymous search by title, and `GET` by id returns 200 with `status == "Active"`.
- [ ] **Step 6:** Run `dotnet test Tests/Catalog/MC.Catalog.IntegrationTests` (Docker running). Expected: all pass.
- [ ] **Step 7:** Report the changed files.

### Task 3: Client listing entity (status, owner API, writes)

**TDD:** yes, for the mappers, parsing and request building.

**Files** (paths under `Clients/mc.market.reactwebapp/src/entities/listing/`):
- Modify: `model/constants.ts` (add `LISTING_STATUSES`), `model/types.ts`, `model/parse.ts`, `api/listings.ts`, `index.ts`
- Create: `lib/listingAvailability.ts`
- Test: `model/__tests__/parse.test.ts`, `lib/__tests__/listingAvailability.test.ts`, `api/__tests__/listings.test.ts`

**Interfaces:**
- Consumes: the Task 2 routes, and these body and response fields:
  - Detail responses add `condition` and `status`, PascalCase strings (`"Draft"`).
  - Owner page items are `{ id, title, price, stock, status, imageId, createdAt }`.
- Produces (all exported from `@/entities/listing`):
  - Types:
    - `type ListingStatus = "draft" | "active" | "disabled"`
    - `Listing` gains `status: ListingStatus`. `condition` is now read from the response, and the "does not return these yet" comment loses `condition`.
    - `interface OwnerListing { id: string; title: string; price: number; stock: number; status: ListingStatus; imageId: string; createdAt: string }`
    - `interface OwnerListingPage { items: OwnerListing[]; pageIndex: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean }`
    - `interface ListingInput { title: string; description: string; condition: ListingCondition; categoryId: number; location: { country: string; region: string; city: string; district: string }; price: number; stock: number; tags: string[]; parameters: ListingParameter[] }`
  - `parseListingStatus(value: string | null): ListingStatus | null`, lowercase input like `parseListingCondition`.
  - `type ListingAvailability = "draft" | "active" | "sold-out" | "disabled"` and `listingAvailability(listing: { status: ListingStatus; stock: number }): ListingAvailability`. It returns `"sold-out"` only for an active listing with stock ≤ 0.
  - API functions. Each sends `Authorization: Bearer <token>`, uses `readResponse` like `clarifyAccountType` does, and the write functions map a detail response with `mapListing`:
    - `getListingById(id, signal?, accessToken?)`: the bearer header is added only when `accessToken` is given.
    - `getMyListings(accessToken, { pageIndex, pageSize }, signal?) -> Promise<OwnerListingPage>`: `GET /api/listings/mine?pageIndex=&pageSize=`.
    - `createListing(accessToken, input, signal?) -> Promise<Listing>`: `POST /api/listings/create`. The body maps `stock` to `stockQuantity`, `condition` to PascalCase, and adds `imageLinks: []`. Location latitude and longitude are sent as `0`.
    - `updateListing(accessToken, id, input, signal?) -> Promise<Listing>`: `PUT /api/listings/{id}`. Same body as create, without `imageLinks`.
    - `changeListingStatus(accessToken, id, action: "publish" | "disable" | "activate", signal?) -> Promise<Listing>`: `POST /api/listings/{id}/{action}`.
    - `deleteListing(accessToken, id, signal?) -> Promise<void>`: `DELETE /api/listings/{id}`.

- [ ] **Step 1: Write the failing tests.**
  - `parse.test.ts`: `parseListingStatus` accepts `draft`, `active` and `disabled`, and returns `null` for anything else.
  - `listingAvailability.test.ts`:
    - draft → `draft`
    - active with stock 3 → `active`
    - active with stock 0 → `sold-out`
    - disabled with stock 0 → `disabled`
  - `listings.test.ts` (stub `fetch` with `vi.stubGlobal`):
    - `mapListing_reads_status_and_condition` (`"Draft"`, `"Used"`) and `mapListing_rejects_unknown_status`
    - `getMyListings_sends_bearer_and_maps_items`
    - `createListing_posts_body_with_stockQuantity_pascal_condition_and_empty_imageLinks`
    - `updateListing_puts_to_listing_url`
    - `changeListingStatus_posts_to_action_url`
    - `deleteListing_sends_delete`
    - `getListingById_adds_bearer_only_when_token_given`
- [ ] **Step 2:** Run `cd Clients/mc.market.reactwebapp && npm run test`. Expected: the new tests fail.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `npm run validate && npm run test`. Expected: pass.
- [ ] **Step 5:** Report the changed files.

### Task 4: Client "My listings" and the listing form

**TDD:** only for the pure functions: `showSellerNav`, `allowedListingActions`, `validateListingForm` and `toListingInput`. The components and pages are glue.

**Files** (paths under `Clients/mc.market.reactwebapp/src/`):
- Modify:
  - `entities/session/model/selectors.ts` (+ export) and its test
  - `widgets/site-header/model/navLinks.ts` and its test
  - `shared/config/routes.ts`
  - `app/routing/router.tsx`
  - `pages/listing-details/ui/ListingDetailsPage.tsx`
- Create:
  - `features/listing-status/{index.ts, model/allowedListingActions.ts, model/useListingStatusMutations.ts, ui/ListingStatusActions.tsx, ui/ListingStatusBadge.tsx}`
  - `features/listing-editor/{index.ts, model/listingForm.ts, model/useSaveListing.ts, ui/ListingForm.tsx, ui/CategoryPicker.tsx}`
  - `pages/my-listings/{index.ts, model/useMyListingsQuery.ts, ui/MyListingsPage.tsx}`
  - `pages/listing-editor/{index.ts, ui/ListingEditorPage.tsx}`
- Test: `features/listing-status/model/__tests__/allowedListingActions.test.ts`, `features/listing-editor/model/__tests__/listingForm.test.ts`

**Interfaces:**
- Consumes: Task 3's exports, `useSessionActions().getAccessToken()`, `useRootCategoriesQuery` and `getCategoryWithChildren` from `@/entities/category`, and `listingImageUrl`.
- Produces:
  - `showSellerNav(session: VisitorSessionView): boolean` is true when the visitor is signed in and `account.accountType` is `"Individual"` or `"Business"`.
  - `getNavLinks` adds `{ to: routes.myListings, label: "My listings" }` after Orders when `showSellerNav` is true.
  - Routes:
    - `myListings: "/my-listings"`
    - `newListing: "/my-listings/new"`
    - `editListing: (id: string) => "/my-listings/" + encodeURIComponent(id) + "/edit"`
    - `myListings` is added to `accountPaths`.
    - Router: all three under `AccountGate`, next to `settings`.
  - `type ListingAction = "publish" | "disable" | "activate" | "delete"` and `allowedListingActions(status: ListingStatus): ListingAction[]`:
    - draft → `["publish", "delete"]`
    - active → `["disable"]`
    - disabled → `["activate"]`
  - `ListingStatusBadge({ listing: { status, stock } })` shows "Draft", "Active", "Sold out" or "Disabled", based on `listingAvailability`.
  - `ListingStatusActions({ listing: { id, status }, onDeleted?: () => void })` shows the allowed actions as buttons. Delete asks for confirmation with `window.confirm("Delete this draft? This can't be undone.")`. The API's error message is shown inline.
  - `useListingStatusMutations()` and `useSaveListing()` are TanStack `useMutation`s. On success they invalidate the `["my-listings"]` key and the listing's detail query key (use the key `useListingQuery` already uses).
  - `ListingFormValues`: every field as a string (tags comma-separated), parameters as `{ name, value }[]`, `categoryId: number | null`.
    - `validateListingForm(values): Partial<Record<keyof ListingFormValues, string>>` mirrors the Task 2 limits, with messages such as `"Title is required."` and `"Price must be greater than 0."`.
    - `toListingInput(values): ListingInput` trims values, splits tags on commas, drops empty tags, and drops parameter rows where both name and value are empty.
    - `fromListing(listing): ListingFormValues` fills the form for editing.
  - `CategoryPicker`: a drill-down of selects, starting from the root categories and showing the children of each selected category. It reports the deepest selected id.
  - `useMyListingsQuery(pageIndex)` uses key `["my-listings", pageIndex]` and a page size of 20.

Behaviour:
- **My listings page:** the sketch from spec decision 6.
  - Rows: an image (the first image, or the existing placeholder), the title (linked to the edit page), the price, the status badge, `ListingStatusActions` and an "Edit" link.
  - A "New listing" button, Previous/Next pagination, and an empty state saying "No listings yet."
- **Editor page:**
  - It runs in create mode with no `listingId`. In edit mode it loads the listing with `getListingById(id, signal, await getAccessToken())`.
  - Create mode shows only the form. After a successful create it navigates to the edit page with `replace`.
  - Edit mode shows the badge and `ListingStatusActions` above the form. After a delete it navigates to `routes.myListings`.
  - A 404 shows "Listing not found."
- **Listing details page:** when `listingAvailability(listing) === "sold-out"`, it shows "Sold out" instead of the stock line and disables "Buy Now".

- [ ] **Step 1: Write the failing tests.**
  - Selectors: `showSellerNav` is true for `Individual` and `Business`, and false for `Basic`, for a guest, and for a `null` account type.
  - `navLinks.test.ts`: "My listings" appears only for sellers, and comes right after Orders.
  - `allowedListingActions.test.ts`: the three mappings above.
  - `listingForm.test.ts`:
    - `validateListingForm` flags an empty title, a price of `"0"`, a stock of `"-1"`, a missing category and 21 tags.
    - It passes for a complete form.
    - `toListingInput` trims, splits tags, and drops empty parameter rows.
    - `fromListing` round-trips through `toListingInput`.
- [ ] **Step 2:** Run `npm run test`. Expected: the new tests fail.
- [ ] **Step 3:** Implement the features, pages, routes and the change to the details page.
- [ ] **Step 4:** Run `npm run validate && npm run test && npm run build`. Expected: all pass.
- [ ] **Step 5: Manual check** with the AppHost running, signed in as a seller:
  - [ ] "My listings" is in the header.
  - [ ] Create a listing: it shows as "Draft" and doesn't appear in Browse.
  - [ ] Publish it: it appears in Browse.
  - [ ] Set its stock to 0: "Sold out" shows in My listings and on the details page.
  - [ ] Disable it: it's gone from Browse. Activate it: it's back.
  - [ ] Create a second draft and delete it: it's gone.
  - [ ] As a `Basic` user, the "My listings" link is hidden.
- [ ] **Step 6:** Report the changed files.

## Final verification

- `dotnet build MarketCustoms.slnx`
- `dotnet test Tests/Catalog/MC.Catalog.UnitTests && dotnet test Tests/Catalog/MC.Catalog.IntegrationTests`
- `cd Clients/mc.market.reactwebapp && npm run validate && npm run test && npm run build`
- Phase file: leave the "Done when" items unticked. The 403-on-edit item is covered by `Editing_someone_elses_listing_returns_403`; tick it when the PR merges.
