# Real sellers and profile listings: design

Date: 2026-11-13
Scope: Catalog API, Profiles API, web client (`Clients/mc.market.reactwebapp`)

## Goal

1. On a listing's details page, the seller card shows the real owner (name and avatar) and links to the owner's profile.
2. A profile page shows that user's real listings, loaded from Catalog by owner.
3. Any visitor, including a guest, can open another user's profile at `/profile/:profileId`. `/profile` with no ID stays the signed-in user's own profile.

## Decisions

- **Route shape:** `/profile/:profileId` is public. `/profile` stays behind `AccountGate` and resolves to `account.profileId`.
- **Seller scope:** only the listing details page shows the real seller. Browse, home and related cards are unchanged. They have no `ownerId`, and showing sellers there would need a batch profiles endpoint, which is out of scope.
- **No new endpoints.** Two additive backend changes:
  - an optional owner filter on the existing listings search;
  - `PictureUrl` on the existing public profile response.
- **Placeholders stay:** the profile stats (rating, sales, response), the Reviews tab, the cover image and the Message/Follow buttons keep today's static content. Nothing serves real data for them yet. The "Active" stat is not made real either, because the paginated response has no item total.
- **TDD** for:
  - the Catalog owner filter (integration test);
  - the frontend mappers and `listingSearchBody`.

  Not used for routing, hooks or page wiring.

## Current behaviour

- `ListingDetailsPage` seller card: shows `—` for name and initials, and links to `routes.profile` (always the viewer's own profile). The listing already carries `ownerId` (`ListingDetailedResponse.OwnerId`, mapped to `Listing.ownerId`).
- `ProfilePage`: renders the signed-in account from `useVisitorSession()` and a hard-coded array of six listings.
- `GET /profiles/{id:guid}` (`[AllowAnonymous]`) returns `PublicProfileResponse(Id, DisplayName, Bio, IsSeller)`.
- `POST /listings` accepts `ListingParams(CategoryId, Title, Sort, Condition, Parameters)`. It has no owner filter.
- Seeded listings use `SeedIds.Seller(i)` as `OwnerGuid`, and seeded profiles use the same IDs. Seeded data therefore links up end to end.

## Design

### 1. Catalog: owner filter

- `MC.Catalog.Application/Models/ListingParams.cs`: add `Guid? OwnerId` as the **last** positional parameter.
- `ListingRepository.GetListingsCatalogViewAsync`: when `listingParams.OwnerId` has a value, add `filterBuilder.Eq(p => p.OwnerGuid, listingParams.OwnerId.Value)`. It combines with the other filters using `&=`.
- `ListingParamsValidator`: when `OwnerId` is set, reject `Guid.Empty`.
- Request body example: `POST /api/listings?pageSize=12` with `{ "ownerId": "<guid>" }`.
- Test, in `MC.Catalog.IntegrationTests/Api/ListingsControllerTests.cs`:
  1. Create listings for two different owners with the authenticated client. `CreateListingRequest` carries `OwnerGuid`.
  2. Search with one owner's GUID.
  3. Assert that only that owner's listings come back.
  4. Search with a fresh GUID and assert an empty result.

### 2. Profiles: picture on the public profile

- `PublicProfileResponse`: add `string? PictureUrl` (after `DisplayName`).
- `ProfileService.GetProfileInfo`: map `profile.PictureUrl`.
- No schema change; the column already exists. The uncommitted Profiles migration work in the working tree is not touched.

### 3. Web client: data layer

- `shared/config/routes.ts`: add `userProfile: (id: string) => \`/profile/${encodeURIComponent(id)}\``.
- `entities/profile`:
  - `model/types.ts`: `PublicProfile { id: string; displayName: string; bio: string | null; pictureUrl: string | null; isSeller: boolean }`.
  - `api/profiles.ts`:
    - `mapPublicProfile(body)` throws on a missing `id`, `displayName` or boolean `isSeller`.
    - `getPublicProfile(id, signal)` calls `GET /api/profiles/{id}` through `readResponse`.
  - `api/usePublicProfileQuery.ts`: `useQuery` keyed `["profiles", "public", id]`, `enabled: !!id`.
  - Export the type, the function and the hook from `index.ts`.
- `entities/listing`:
  - `ListingQueryParams` gets `ownerId?: string`. `listingSearchBody` passes it through when it is a non-empty trimmed string, and counts it as making a body.
  - `getListings` input accepts `ownerId`.
  - `api/useOwnerListingsQuery.ts`:
    - `useOwnerListingsQuery(ownerId, pageIndex)` calls `getListings({ ownerId, pageIndex, pageSize: 12 })`.
    - It returns the full paginated response, is keyed `["listings", "owner", ownerId, pageIndex]` and uses `enabled: !!ownerId`.
  - Export the hook from `index.ts`.

### 4. Web client: routing and pages

- Router (`app/routing/router.tsx`):
  - `profile/:profileId` (ProfilePage) is a sibling of `listings/:listingId`, outside `AccountGate`.
  - `profile` stays inside `AccountGate`.
- `ProfilePage`:
  - `profileId = useParams().profileId ?? account?.profileId`.
  - `isOwn = !!account?.profileId && account.profileId === profileId`.
  - Data: `usePublicProfileQuery(profileId)`.
  - States:
    - **No `profileId`** (signed in, but metadata not loaded): show the "Loading…" status message.
    - **404:** show "Profile not found" with a Back to Browse button, the same pattern as `ListingDetailsPage`.
    - **Pending / error:** show a `StatusMessage`.
  - Header:
    - Name: `profile.displayName`.
    - Avatar: `profile.pictureUrl`, with initials from `getInitials(displayName)`. On your own profile, the session `account.photoUrl` is the fallback.
    - **Own profile:** keeps the verified/unverified badge, the "Verify email" link and the email handle.
    - **Someone else's profile:** shows none of these.
  - Listings tab:
    - `useOwnerListingsQuery(profileId, page)`, with `page` held in local state starting at 1.
    - Renders with the existing `ListingCard` grid.
    - **Pending / error:** inline `StatusMessage`.
    - **Empty:** "No active listings".
    - **Paging:** Prev/Next buttons when `totalPages > 1`, driven by `hasPreviousPage` / `hasNextPage`.
  - About tab: `profile.bio`, or "No bio yet." when it is null.
  - Reviews tab, stats, cover, Message/Follow: unchanged.
- `ListingDetailsPage` seller card:
  - Uses `usePublicProfileQuery(listing.ownerId)`.
  - Shows the name (`—` while loading or on error) and an avatar (`pictureUrl`, initials fallback).
  - Links to `routes.userProfile(listing.ownerId)`.
  - The rating, sales and location line is unchanged.

## Error handling

- A failure to load the seller profile on the listing page doesn't block the page. The card keeps its `—` placeholders.
- A listing whose owner has no profile (404) still renders, and the card shows `—`.

## Verification

- Web client: `npm run lint`, `npm run test`, `npm run build`.
- Backend:
  - `dotnet build` of the solution.
  - The Catalog integration tests (needs Docker).
  - The Profiles and Catalog unit-test projects. These appear out of date compared with the current code (`ShopName`, `CompleteClarification`, the old `GetListingsCatalogViewAsync` signature), so they may not compile today. Their status is reported, and repairing them is out of scope.

## Out of scope / follow-ups

- Seller names on browse, home and related cards (needs `ownerId` in the card view and a batch profiles endpoint).
- Real rating, sales and response stats, reviews, an active-listings count, and Message/Follow.
- Repairing the out-of-date unit-test projects.
