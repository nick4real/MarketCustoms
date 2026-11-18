# Phase 10: Reviews, promotions and admin

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** the features that make the marketplace complete, using the patterns already in place.

**User story:** as a buyer, I rate a seller after a completed order. As a seller, I pay to promote a listing. As an admin, I remove listings, view orders and resolve disputes.

**Services touched:** Reviews, Promotions, Catalog, Ordering, Payments, Profiles, web client (including an admin area).

**Scope:**

- Reviews: one review per completed order, seller rating aggregated into Profiles via events. The placeholder profile stats become real.
- Promotions: paid promoted listings (Stripe payment, a time window) that rank higher in search; discount codes.
- Admin area protected by the Auth0 `admin` role (Phase 1): remove listings, view orders, handle disputes and refunds, moderate conversations.
- **Azure AI Content Safety** (free F0 tier): listing images, listing text and reviews are checked when submitted. Flagged items are hidden and go into an admin moderation queue to approve or remove. Behind an interface with a fake when no key is configured.
- Hardening: rate limiting on YARP, audit log of admin actions, alerts on OpenTelemetry metrics, end-to-end test of the full buy flow with `Aspire.Hosting.Testing`.

**Out of scope:** anything listed under Not in this project.

**New technology:** Azure AI Content Safety; otherwise reuses Stripe, RabbitMQ, Auth0 and Elasticsearch.

**Open decisions:** separate admin app vs a route in the existing client; moderation severity thresholds, and whether flagged content is hidden immediately or published until reviewed.

**Done when:**

- [ ] A completed order can be reviewed once, and the rating shows on the seller profile.
- [ ] A promoted listing ranks first for a matching search during its window.
- [ ] Admin actions are blocked for non-admins and recorded in the audit log.
- [ ] A review with abusive text lands in the moderation queue instead of on the seller profile.
