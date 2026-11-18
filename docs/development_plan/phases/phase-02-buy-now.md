# Phase 2: Buy now

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** a buyer pays for a single listing, and the system stays consistent across services. This is the hardest phase.

**User story:** as a buyer, I click "Buy now", pay with a Stripe test card, and see my order as paid. As a seller, I see the paid order. Two buyers can never pay for the last unit.

**Services touched:** Ordering, Payments, Catalog, Gateway, web client (`orders` page).

**Scope:**

- Ordering service in the AppHost with its own database. Order state machine: `Created`, `PendingPayment`, `Paid`, `Shipped`, `Completed`, `Cancelled`, `Refunded`, with transitions enforced in the domain (TDD).
- RabbitMQ (via Aspire locally) for integration events between Ordering, Payments and Catalog. No synchronous chains of HTTP calls in the checkout path.
- **Transactional outbox** in each publishing service, plus an idempotent inbox on the consumer side, so "order paid" reliably reaches Catalog.
- **Checkout saga:** reserve stock → create a payment → on success, confirm the reservation and decrement `StockQuantity`. On failure or timeout, release the reservation and cancel the order.
- **Stock reservation with a timeout** (for example 15 minutes) so abandoned checkouts free up the stock.
- Payments service: Stripe Checkout Session in test mode, and a webhook endpoint that verifies the **signature** and is **idempotent** (handling the same event twice has no effect).
- Basic cancel (before shipping) and full refund through Stripe.
- React: a "Buy now" button, redirect to Stripe and back, and an order list and order details for buyer and seller.

**Out of scope:** cart and multi-item orders (Phase 7), seller payouts (Phase 3), partial refunds.

**New technology:** RabbitMQ, outbox/inbox pattern, saga, Stripe Checkout and webhooks.

**Open decisions:**

- Messaging library: MassTransit (v9 needs a commercial licence; v8 is open source but nearing end of support), Wolverine, or raw `RabbitMQ.Client`. Phase 5 needs the same code to run on Azure Service Bus, which favours a library with both transports. Record it in an ADR.
- Saga style: orchestration (Ordering drives the steps) vs choreography (each service reacts to events).
- Where the reservation lives: Catalog (MongoDB atomic update) vs a Redis lock with a TTL.
- Ordering storage: SQL Server (EF Core) vs MongoDB.

**Done when:**

- [ ] A buyer completes a purchase with Stripe test card `4242 4242 4242 4242`. The order becomes `Paid` and the stock goes down by one.
- [ ] Two concurrent checkouts for the last unit: one succeeds, the other is rejected (integration test).
- [ ] Replaying the same Stripe webhook does not change anything (test).
- [ ] An abandoned checkout releases its stock after the timeout.
- [ ] Stopping Catalog during a payment and restarting it still ends in a consistent state (outbox delivers the event).
