# 0004: Listing lifecycle

- **Status:** Accepted
- **Date:** 2026-11-19

## Context

Listings have no status today: every listing is visible and nothing can be taken down. Phase 1 needs drafts, publishing and a way to remove a listing. Phase 2 (Buy now) needs to know which listings can be bought, and will decrement `StockQuantity` when an order is paid. A listing can hold several units, so several buyers can be checking out the same listing at once. Once a listing has been published, buyers may have links to it, and from Phase 2 orders will point to it.

The roadmap proposed `Draft`, `Active`, `SoldOut` and `Removed`, and left open whether a multi-unit listing needs a `Reserved` status.

## Options considered

1. **`Draft`, `Active`, `SoldOut`, `Removed`, with `SoldOut` set automatically at zero stock.** The roadmap's proposal. Stock changes then change the status, so Phase 2 has to update both, and restocking has to move the listing back to `Active`. `Removed` is a soft delete that never comes back.
2. **The above plus `Reserved`.** Marks a listing while a checkout is in progress. It doesn't fit a listing with several units: one reservation would block the other units.
3. **`Draft`, `Active`, `Disabled`; sold out derived from stock; reservation tracked per unit in Phase 2.** The status says only what the seller chose. An `Active` listing with zero stock shows as sold out and can't be bought. A published listing is taken down by disabling it, which the seller can undo.

## Decision

Option 3. The status records the seller's intent and stock records availability, so neither has to keep the other in sync, and Phase 2 only touches stock.

- `Draft` → publish → `Active`; `Active` ↔ `Disabled` through disable and activate. A disabled listing doesn't go back to `Draft`.
- Only a `Draft` can be deleted (hard delete, with its images). Deleting any other listing returns 409, as does any other invalid transition.
- Browse, search and `GET /listings` return only `Active` listings, sold-out ones included. `Draft` and `Disabled` listings are visible only to their owner and to holders of `listings:moderate`; anyone else gets 404.
- Editing is allowed in every status.

## Consequences

- Phase 2 decrements `StockQuantity` without touching the status, and keeps its reservations per unit (where they live is a Phase 2 open decision).
- Every read that a buyer can reach has to filter on `Active`, and the client shows "Sold out" from the stock, not from a status.
- Existing and seeded listings have no status, so they have to end up `Active` or browse would go empty.
- A published listing is never hard-deleted, so links and future orders always point to a listing that exists.
