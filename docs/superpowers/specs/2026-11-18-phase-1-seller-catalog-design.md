# Phase 1 (Seller catalog): design

Date: 2026-11-18
Roadmap: [Phase 1: Seller catalog](../../development_plan/phases/phase-01-seller-catalog.md)
Scope: Catalog, Profiles, Shared API, AppHost, Gateway, web client, Auth0 tenant configuration.

## Intent

Sellers fully manage their own listings: create a listing with photos, publish it, edit it, take it down, and nobody else can change it. Phase 2 (Buy now) depends on this: it needs listings with a trusted owner, a status that says what can be bought, and stock that can be decremented.

This is a learning project. Phase 1 is where Auth0 roles and permissions, Azure Blob Storage (through Azurite) and Redis enter the system, so each one should be used the way it would be in a real system, not stubbed.

## Success

The phase's "Done when" list (in the phase file) is the bar:

- A seller creates, publishes, edits and removes a listing with images from the browser.
- Editing someone else's listing returns 403 (integration test).
- A non-admin gets 403 on `POST /categories`.
- The category tree is cached in Redis: a cache miss fills Redis, and other instances read it from Redis (visible in traces). *(Reworded from "served from Redis on the second request", because of the in-memory cache layer, see decision 5.)*

## Goals, non-goals, anti-goals

- **Goals:** a trusted listing owner; selling rights and an admin role enforced from the access token; the listing lifecycle; image upload; a Redis-cached category tree; a "My listings" area in the client.
- **Non-goals:** orders, stock reservation (Phase 2); search beyond the existing filters (Phase 6); an admin UI for roles (roles are assigned by hand in the Auth0 dashboard); thumbnails (Phase 5); a direct-to-Blob SAS upload (see decision 4).
- **Anti-goals:**
  - Catalog trusting anything identity-related from the request body (today `CreateListingRequest.OwnerGuid` does exactly that).
  - A Catalog write that needs a call to Profiles to decide who the user is or what they may do.
  - Hard-deleting a listing that was ever published: buyers may have links to it, and from Phase 2 orders will point to it.

## Current state (what the design changes)

- `Listing` (`Services/Catalog/MC.Catalog.Domain/Entities/Listing.cs`) has `OwnerGuid`, `StockQuantity` and `ImageLinks` and no status. Listings can be read, searched (`POST /listings`) and created (`POST /listings/create`), not updated or deleted.
- `CreateListingRequest` takes `OwnerGuid` and `ImageLinks` from the body.
- `POST /categories` is open to any authenticated user.
- Profiles: `AccountType` is `Basic`, `Individual` or `Business`; `IsSeller` means "not `Basic`". `ProfileService.ClarifyAccountType` changes the account type. `IIdentityService.GrantSellerAsync` (which PATCHes `app_metadata.is_seller`) exists but **is never called**, and nothing reads `is_seller`.
- No Auth0 Action, no custom claims, no permissions in the token. `LocalTestAuthenticationHandler` builds test identities from an `Authorization: LocalTest <userId>;key=value...` header.
- The AppHost runs SQL Server, MongoDB, Profiles, Catalog, the gateway and Vite. `IsolatedTestComposition` builds a smaller graph per service for integration tests.

## Decisions

### 1. Identity and selling rights: Auth0 roles and permissions, plus a profile-id claim

Chosen over having Catalog ask Profiles for the account type on each write.

- **Auth0 API permissions:** `listings:write` (create and manage your own listings), `listings:moderate` (manage and see anyone's listings, in any status) and `categories:write`.
- **Roles:** `seller` (`listings:write`) and `admin` (every permission of the API, now and as later phases add more). "Add permissions in the access token" (RBAC) is turned on for the API, so the token carries a `permissions` array. Catalog authorizes from permissions only; it never reads role names, so "admin" in this doc means "holds the permission in question". A listing must have an owner, so creating one also needs the `profile_id` claim, which every user with a profile has (below). An admin can therefore create listings without picking an account type.
- **What the account type means:** every user has a profile. `Basic` means the user hasn't said whether they sell as a private person or as a company, so they can't sell yet. `Individual` or `Business` records that legal form (room for legal requirements later) and opens selling.
- **Who gets `seller`:** when `ClarifyAccountType` sets `Individual` or `Business`, Profiles assigns the `seller` role through the Management API (`POST /api/v2/users/{id}/roles`). Setting `Basic` removes it. `GrantSellerAsync` is reworked into this (grant and revoke).
- **`is_seller` is deleted:** the `app_metadata.is_seller` write in `Auth0ManagementIdentityService` and the `is_seller` option of `LocalTestAuthenticationHandler` go away; the `seller` role replaces them. The `isSeller` field in profile responses stays: it's derived from the account type, and the client shows it on public profiles.
- **If Auth0 fails:** Profiles calls the Management API first and saves the account type only after it succeeds; on failure nothing is saved and the call returns an error, so the profile and the token can't disagree. The Auth0 steps are idempotent, so the user simply retries. Profile creation follows the same rule: write `profile_id` to Auth0, then save. *(My call.)*
- **Who gets `admin`:** assigned by hand in the Auth0 dashboard.
- **Profile id in the token, for everyone:** when `GetAndEnsureCurrentUserProfile` creates a profile, Profiles writes `app_metadata.profile_id` (the profile's `Guid`) through the Management API (it also writes it for an existing profile whenever the caller's token has no `profile_id` claim, which fixes accounts created before this phase; a token that has the claim costs no Auth0 call). A post-login Auth0 Action copies it into the access token as a namespaced custom claim (for example `https://marketcustoms/profile_id`). Buyers need it too from Phase 2 on (orders).
- **Token refresh:** a token issued before a change doesn't show it. The client gets a fresh token (`getAccessTokenSilently` with `cacheMode: 'off'`) after the profile is first created (to pick up `profile_id`) and after the account type changes (to pick up `listings:write`).
- **In `MC.Shared.API`:**
  - one authorization policy per permission (for example `[Authorize(Policy = Permissions.ListingsWrite)]`), checking the `permissions` claim;
  - `ICurrentUserService` gains `ProfileId` (from the custom claim) and `HasPermission(string)`; there is no `IsAdmin` member, so admin checks ask for a permission (Catalog checks `listings:moderate`).
- **Tests:** `LocalTestAuthenticationHandler` accepts `permissions=a,b` and `profile_id=<guid>` in its header, so integration tests can act as a seller, an admin or a stranger without Auth0.
- **In the repo:** the Action's source in `infra/auth0/` with a short setup note (roles, permissions, RBAC toggle, Management API scopes the backend M2M client needs: `update:users`, `create:role_members`, `delete:role_members`), and an ADR. The `seller` role id is configured (`Auth0-SellerRoleId`), so Profiles needs no role lookup and no `read:roles` scope.

### 2. Listing lifecycle

```
Draft ──publish──▶ Active ◀──disable / activate──▶ Disabled
                     │
                     └─ shown as "Sold out" while stock = 0
```

- **Statuses:** `Draft`, `Active`, `Disabled`. This replaces the roadmap's `Draft`/`Active`/`SoldOut`/`Removed`.
- **Sold out is derived, not stored:** an `Active` listing with `StockQuantity = 0` shows as sold out and can't be bought. Restocking puts it back on sale with no extra step, and Phase 2 never changes the status when it decrements stock.
- **No `Reserved` status:** reservation is tracked per unit in Phase 2 (the roadmap's recommendation, now settled).
- **Visibility:** browse, search and `GET /listings` return only `Active` listings (sold-out ones included). `Draft` and `Disabled` listings are visible only to their owner and to admins; anyone else gets 404 for them.
- **Editing** is allowed in every status. A disabled listing doesn't go back to `Draft`.
- **Removing:** only a `Draft` can be deleted (hard delete, including its images). A published listing is removed by disabling it. Deleting a non-draft returns 409.
- **Ownership:** every write (update, status change, delete, image upload or removal) is allowed for the listing's owner (`OwnerGuid` equals the token's profile id) or a holder of `listings:moderate`. Anyone else gets 403. Creating requires `listings:write`; `OwnerGuid` comes from the token.
- **Invalid transitions** (for example publishing an `Active` listing) return 409.

### 3. Endpoints (Catalog, routed through the existing gateway catch-all for the service)

Existing routes keep their shape; new ones:

| Method and route | Who | Notes |
| --- | --- | --- |
| `POST /listings/create` | `listings:write` | Creates a `Draft`. `OwnerGuid` and `ImageLinks` leave the request. |
| `PUT /listings/{id}` | owner or admin | Title, description, condition, category, location, price, stock, tags, parameters. |
| `DELETE /listings/{id}` | owner or admin | `Draft` only. |
| `POST /listings/{id}/publish` | owner or admin | `Draft` → `Active`. |
| `POST /listings/{id}/disable` | owner or admin | `Active` → `Disabled`. |
| `POST /listings/{id}/activate` | owner or admin | `Disabled` → `Active`. |
| `POST /listings/{id}/images` | owner or admin | Multipart, one file per request. |
| `DELETE /listings/{id}/images/{imageName}` | owner or admin | |
| `GET /listings/mine` | `listings:write` | The caller's listings in every status, paginated. |
| `POST /categories` | `categories:write` | Was open to any authenticated user. |

Responses include the listing's `status`. Each endpoint follows the definition of done: validator, `Result`-based errors, unit and integration tests.

### 4. Images: upload through the API

Chosen over a SAS URL for direct-to-Blob upload. The type and size checks run before anything is stored, the upload goes through the gateway like every other call, and integration tests against Azurite stay simple. Image bytes passing through the API doesn't matter at this size. SAS fits better for large files and private downloads; Phase 8 chat attachments (a read SAS) are the natural place to learn it, and the ADR says so.

- **Storage:** Azure Blob Storage, Azurite locally through Aspire's Azure Storage hosting integration; the Catalog API uses the Aspire Blob client integration.
- **Container:** `listing-images`, anonymous read access on blobs, so the browser loads images straight from their URLs.
- **Blob names:** `{listingId}/{random}.{ext}`.
- **Validation:** content type `image/jpeg`, `image/png` or `image/webp`, checked against the file's first bytes, not just the header; at most 5 MB per file; at most 10 images per listing.
- **What is stored:** the listing keeps `ImageLinks` in display order, holding **names, not URLs**: a blob name (`{listingId}/{random}.{ext}`) for uploads, or the existing Unsplash photo id for seeded listings. Full URLs would break when Azurite's port changes and when the app moves to Azure (Phase 5). *(My call.)*
- **What is returned:** Catalog turns each name into a full URL when it builds a response (blob names → the Blob endpoint's public base URL from configuration; Unsplash ids → the Unsplash URL, the logic now in the client's `entities/listing/lib/listingImageUrl.ts`). The response carries both name and URL per image, so the client can delete by name; `listingImageUrl.ts` goes away. *(My call.)*
- Removing an image deletes the blob and the name. Deleting a draft deletes all its blobs.
- **Images are optional:** a listing can be published with none. The client shows a placeholder image wherever a listing has no images (cards, details page, "My listings").

### 5. Category tree cache: HybridCache with Redis

- **Library:** `HybridCache` (`Microsoft.Extensions.Caching.Hybrid`) with Redis as the distributed layer, through Aspire's Redis integration (Redis container in the AppHost, Redis calls traced automatically).
- **One entry: the whole category tree.** There is no full-tree endpoint today; the client uses `GET /categories`, `/{id}` and `/children/{id}`, and `/tree/{id}` exists. All four are served from the one cached tree, read with `GetOrCreateAsync` (built from SQL Server on a miss), so `CategoryService`'s reads are reworked to look up in the cached tree. One entry keeps invalidation trivial. In-memory copy: 30 seconds. Redis copy: 1 hour, as a safety net. *(My call.)*
- **Invalidation:** `POST /categories` removes the entry (`RemoveAsync`), which clears Redis and that instance's in-memory copy. It's the only category write with an endpoint; `RenameCategoryAsync` and `DeleteCategoryAsync` exist in `CategoryService` without endpoints and stay that way, but they also clear the entry, so exposing them later needs no cache work. *(My call.)*
- **Accepted trade-off:** HybridCache doesn't tell other instances to drop their in-memory copy. With several replicas (Phase 4), they serve a stale tree for at most 30 seconds after an admin change. That's why the "Done when" item is reworded.
- Stampede protection comes with HybridCache: concurrent misses build the tree once.

### 6. Client: "My listings"

New FSD pieces in `Clients/mc.market.reactwebapp`:

- **Page `my-listings`:** the seller's listings with status badges ("Draft", "Active", "Sold out", "Disabled") and actions (edit, publish, disable, activate, delete for drafts). Reached from the profile menu, shown only when the user is a seller.
- **Pages for create and edit** (or one page with a mode): a form with image upload (preview, remove, the 5 MB and type limits shown and checked before upload), and the status actions.
- **Features:** `listing-editor` (create and edit form), `listing-status` (the status actions), `listing-images` (upload and remove).
- **Entity `listing`:** add `status` and the new API calls.
- **"Become a seller" in Settings:** today nothing in the client calls `clarify-account-type`, and the endpoint and its request are marked `// TODO` in Profiles. A Settings section shows the account type and lets the user pick `Individual` or `Business` (or go back to `Basic`). It calls `clarify-account-type`, then gets a fresh token (decision 1) and refetches the profile, so "My listings" appears straight away. Choosing the same type again re-runs the Auth0 steps, which is how accounts that were already `Individual` or `Business` before this phase get their role and claim: no backfill script. Profiles finishes the `clarify-account-type` endpoint (validation of the type, the TODOs removed).
- Sketch:

```
My listings                                   [+ New listing]
┌──────┬───────────────────────┬──────────┬──────────────────────────┐
│ img  │ Vintage camera        │ Active   │ Edit · Disable           │
│ img  │ Desk lamp             │ Sold out │ Edit · Disable           │
│ img  │ Oak chair             │ Draft    │ Edit · Publish · Delete  │
│ img  │ Old phone             │ Disabled │ Edit · Activate          │
└──────┴───────────────────────┴──────────┴──────────────────────────┘
```

## Order of work

Each step is shippable on its own, as one PR:

1. **Roles and ownership:** Auth0 setup note and Action, the shared policy helper and `ICurrentUserService` additions, the test handler options, Profiles assigning and removing the `seller` role, `OwnerGuid` from the token, `POST /categories` limited to `categories:write`, and the client's "Become a seller" section with the token refresh. ADR.
2. **Listing lifecycle:** status, update, publish, disable, activate, delete-draft, `GET /listings/mine`, browse showing only `Active`, plus the client's "My listings" page and form (without images).
3. **Images:** Azurite in the AppHost and test composition, upload and remove endpoints, the client's image upload. ADR.
4. **Category cache:** Redis in the AppHost and test composition, HybridCache, invalidation. ADR.

## Docs and ADRs

- ADRs (numbering continues from 0002):
  - Auth0 roles and permissions, with the profile-id claim (decision 1);
  - listing lifecycle without `SoldOut`, `Removed` or `Reserved` (decision 2);
  - image upload through the API instead of SAS (decision 4);
  - HybridCache with Redis for the category tree (decision 5).
- `phases/phase-01-seller-catalog.md`: scope and open decisions updated to match this design, "Done when" reworded, status `In progress` then `Done` in the roadmap table.
- `README.md`: the Auth0 setup steps (roles, Action, M2M scopes), and the new Azurite and Redis containers. `STRUCTURE.md`: `infra/auth0/`.

## Left to the builder

- Exact claim namespace, policy names and class names.
- How status is stored in MongoDB (string enum, like `Condition`) and how existing documents without a status are handled. Seeded and existing listings should end up `Active`, not `Draft`, so browse keeps working.
- Pagination and sorting for `GET /listings/mine`.
- Whether the create and edit pages are one page or two.

## Risks

- **Auth0 setup is manual.** Roles, permissions, the RBAC toggle, the Action and the M2M scopes live in the tenant, not in code. The setup note has to be exact, and local tests must not depend on it (they use the test handler).
- **Role change and stale tokens:** if the client doesn't refresh the token after becoming a seller, the first create fails with 403. The client step covers it; the error message should say to sign in again.
- **Azurite reachable from the browser:** image URLs point at Azurite's host port. Aspire assigns it; the URLs must use the endpoint the browser can reach.
- **Memory:** Redis and Azurite add two containers to the AppHost (see the "run only what you are working on" principle). Both are small.
