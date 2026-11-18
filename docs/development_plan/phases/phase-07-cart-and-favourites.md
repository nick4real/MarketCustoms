# Phase 7: Cart and favourites

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** buy several items from several sellers at once, and save items for later.

**User story:** as a buyer, I add items from two sellers to my cart, pay once, and two orders are created, one per seller. I can save listings to a wishlist.

**Services touched:** Shopping, Ordering, Payments, Catalog, web client.

**Scope:**

- Shopping service: the cart stored in Redis (hash per user, with a TTL for guests); favourites and wishlists in a durable store.
- Merging a guest cart into the user's cart on login.
- Checkout from the cart: split into one order per seller, one Stripe payment, separate transfers per seller.
- Price and stock re-checked at checkout. Show changes to the buyer.

**Out of scope:** discounts and coupons (Phase 10).

**New technology:** Redis as a data store.

**Open decisions:** one Stripe Checkout Session with several transfers vs a separate session per seller; durable store for wishlists.

**Done when:**

- [ ] A cart with items from two sellers produces two orders and two payouts.
- [ ] A guest cart survives login.
