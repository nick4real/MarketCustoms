# Phase 1: Seller catalog

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** sellers fully manage their own listings.

**User story:** as a seller, I create a listing with photos, publish it, edit it, and take it down. Nobody else can change my listings.

**Services touched:** Catalog, Profiles, Gateway, web client.

**Design:** [Phase 1 design](../../superpowers/specs/2026-11-18-phase-1-seller-catalog-design.md). Built in four steps, one PR each: roles and ownership (done), listing lifecycle, images, category cache.

**Scope:**

- Listing status lifecycle: `Draft`, `Active`, `Disabled` ([ADR 0004](../../adr/0004-listing-lifecycle.md)). "Sold out" is not a status: an `Active` listing with `StockQuantity = 0` shows as sold out. Only `Active` listings appear in browse and search.
- Update, publish, disable, activate and delete-draft endpoints, plus `GET /listings/mine`, with an ownership check (only the owner, or a holder of `listings:moderate`). Only a `Draft` can be deleted; a published listing is taken down by disabling it.
- Selling rights: a `seller` role in Auth0 for `Individual` and `Business` accounts, assigned by Profiles when the account type changes ([ADR 0003](../../adr/0003-auth0-roles-and-permissions.md)).
- Auth0 roles and permissions: an `admin` role, permissions in the access token, a policy-based authorization helper in `MC.Shared.API`. `POST /categories` needs `categories:write`.
- Image upload through the Catalog API to Azure Blob Storage (Azurite locally via Aspire): type checked against the file's first bytes, at most 5 MB per file and 10 per listing, blobs deleted when an image or a draft is removed ([ADR 0005](../../adr/0005-image-upload-through-the-api.md)).
- First Redis use: the category tree cached with `HybridCache` and Redis, cleared when categories change.
- React: a seller dashboard ("My listings") with create and edit forms, image upload and status actions; "Become a seller" in Settings.

**Out of scope:** search beyond the existing filters (Phase 6), orders and stock reservation (Phase 2), thumbnails (Phase 5), an admin UI for roles.

**New technology:** Auth0 RBAC, Azure Blob Storage / Azurite, Redis (cache).

**Open decisions:**

- ~~Is there a `Reserved` status for a multi-unit listing, or is reservation tracked per unit (Phase 2)?~~ Settled: no `Reserved` status; reservation is tracked per unit in Phase 2 ([ADR 0004](../../adr/0004-listing-lifecycle.md)).
- ~~Permissions in Auth0 roles vs an app-side mapping from `AccountType`.~~ Settled: Auth0 roles and permissions ([ADR 0003](../../adr/0003-auth0-roles-and-permissions.md)).
- ~~Upload directly to the API vs a SAS URL that lets the browser upload straight to Blob.~~ Settled: upload through the API ([ADR 0005](../../adr/0005-image-upload-through-the-api.md)).

**Done when:**

- [ ] A seller creates, publishes, edits and removes a listing with images from the browser.
- [ ] Editing someone else's listing returns 403 (integration test).
- [ ] A non-admin gets 403 on `POST /categories`.
- [ ] The category tree is cached in Redis: a cache miss fills Redis, and other instances read it from Redis (visible in traces).
