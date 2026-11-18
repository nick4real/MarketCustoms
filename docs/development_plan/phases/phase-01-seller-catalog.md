# Phase 1: Seller catalog

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** sellers fully manage their own listings.

**User story:** as a seller, I create a listing with photos, publish it, edit it, and take it down. Nobody else can change my listings.

**Services touched:** Catalog, Profiles, Gateway, web client.

**Scope:**

- Listing status lifecycle: `Draft`, `Active`, `SoldOut`, `Removed`. `SoldOut` is set automatically when `StockQuantity` reaches 0. Only `Active` listings appear in search.
- Update, publish, unpublish and delete endpoints, with an ownership check (only the owner, or an admin).
- Selling rights: decide how `AccountType` (`Basic` / `Individual` / `Business`) maps to who can create listings, and enforce it.
- Auth0 roles and permissions: an `admin` role, permissions in the access token, a policy-based authorization helper in `MC.Shared.API`. `POST /categories` becomes admin-only.
- Image upload to Azure Blob Storage (Azurite locally via Aspire): upload, size and type validation, delete when a listing is removed.
- First Redis use: cache the category tree (cache-aside or output caching) with invalidation when categories change.
- React: a seller dashboard ("My listings") with create and edit forms, image upload and status actions.

**Out of scope:** search beyond the existing filters (Phase 6), orders.

**New technology:** Auth0 RBAC, Azure Blob Storage / Azurite, Redis (cache).

**Open decisions:**

- Is there a `Reserved` status for a multi-unit listing, or is reservation tracked per unit (Phase 2)? Recommendation: track it per unit, with no listing-level `Reserved`.
- Permissions in Auth0 roles vs an app-side mapping from `AccountType`.
- Upload directly to the API vs a SAS URL that lets the browser upload straight to Blob.

**Done when:**

- [ ] A seller creates, publishes, edits and removes a listing with images from the browser.
- [ ] Editing someone else's listing returns 403 (integration test).
- [ ] A non-admin gets 403 on `POST /categories`.
- [ ] The category tree is served from Redis on the second request (visible in traces).
