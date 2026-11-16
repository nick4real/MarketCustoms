# Development roadmap: design

Date: 2026-11-16
Scope: documentation only (`docs/development_plan/`)

## Intent

MarketCustoms is the author's main portfolio project. Its purpose is to learn new technologies by using them for real marketplace features, and to keep the code clean enough that ideas and code can be reused in real projects later. There will be no commercial launch, real sellers or real money.

The roadmap gives a long-term picture: a small MVP first, then features added in phases. Each phase is something you can demo and picks up one or more new technologies.

## Goals

- One living roadmap document that says what to build next and why.
- Every target technology gets a real feature that needs it: RabbitMQ, Redis, Elasticsearch, SignalR, Kubernetes, Stripe, Auth0, Kafka, CI/CD.
- Each phase ends in a working state you can demo, with tests and CI.

## Non-goals

- Launch concerns: legal pages, GDPR, VAT/invoices, real KYC, soft launch with real sellers. These are dropped from the old plan.
- Detailed per-endpoint tasks. Each phase gets its own spec and plan when it starts.
- Settling library choices now (for example MassTransit vs Wolverine).

## Anti-goals

- A technology added only to tick a box, with no feature that needs it.
- Phases that leave the app broken or impossible to demo.
- A roadmap that disagrees with the code. The old plan was written from the README alone. The new one must reflect the current state of the code.

## Approaches considered

1. **Feature-led phases (chosen).** Each phase adds one part of the marketplace flow and brings in the technologies it needs. A phase may add no new technology.
2. **One technology per phase.** Rejected: features end up shaped around the tool, which teaches less about when to use it.
3. **Platform first (Kubernetes and CD before features).** Rejected: weeks with nothing to demo, and the manifests have to be redone as services are added.

Variation chosen: proper CI is pulled into Phase 0, because it's cheap and the current workflow is broken.

## Current state the roadmap must reflect

- Only Profiles and Catalog run in the AppHost. The other 9 services are scaffolds.
- CI: only `backend-catalog-ci.yml` exists. It triggers on `staging` (the repo uses `main`), and its path filter points to a misnamed file (`backend-catalog.ci.yml`), so it never runs. The frontend has no CI.
- Profiles account types are `Basic / Individual / Business`, not buyer vs seller.
- `Listing` has `StockQuantity` (multi-unit) and no status. Catalog has no update or delete endpoints for listings. `POST /categories` has no role restriction.
- The web client already has `orders`, `profile` and `browse` pages.

## Phase breakdown (approved)

MVP = Phases 0–4: a seller lists an item, a buyer pays, the seller ships and gets paid, and it's deployed.

| # | Phase | Demo at the end | New technology |
| --- | --- | --- | --- |
| 0 | Foundation | CI on `main` for every service plus the frontend; definition of done; ADR folder | GitHub Actions CI |
| 1 | Seller catalog | Owners create, edit and remove listings with images; listing status (draft/active/sold out/removed); admin-only categories | Auth0 roles/permissions, Azure Blob (Azurite), first Redis cache |
| 2 | Buy now | Single-listing purchase in Stripe test mode; stock reserved, then decremented; seller sees the paid order | RabbitMQ, outbox, checkout saga, Stripe Checkout + webhooks |
| 3 | Fulfilment & notifications | Tracking number, buyer confirms receipt, then seller payout; email (Mailpit locally) and live notifications | Stripe Connect payouts, SignalR |
| 4 | Ship the MVP | Full system on a local kind cluster, auto-deployed from `main` | Kubernetes, Helm, GHCR images, CD |
| 5 | Search | Full-text search, facets, autocomplete | Elasticsearch, synced from listing events |
| 6 | Cart & favourites | Multi-seller cart split into one order per seller; wishlists | Redis as a data store |
| 7 | Conversations | Buyer–seller chat about a listing | SignalR with a Redis backplane on Kubernetes |
| 8 | Analytics | Seller stats (views, conversions, revenue) | Kafka as an event stream |
| 9 | Reviews, promotions, admin | Ratings, paid promoted listings, admin panel | none (reuses Stripe and RabbitMQ) |

Each technology's job is kept separate: RabbitMQ handles workflow commands and events between services, Kafka handles the high-volume event stream for analytics, and Redis covers caching, the cart, reservation locks and the SignalR backplane.

## Deliverable

- `docs/development_plan/ROADMAP.md`, one living document:
  - vision and why;
  - principles: feature-led slices, definition of done, an ADR for each technology or library choice, and each phase gets its own spec and plan in `docs/superpowers/`;
  - a table of technologies and where each is used;
  - the phases: goal, user story, services touched, scope, out of scope, done-when, open decisions;
  - a status for each phase (Not started / In progress / Done);
  - a parking lot for ideas that come later.
- The useful content of `MarketCustoms MVP Plan.md` (outbox, idempotent webhooks, reservation timeout, order state machine, the RAM advice) is folded into the relevant phases. The old file is then deleted.
- Kubernetes is local only (kind). A cloud cluster is an optional add-on listed in the parking lot.

## Left to the writer

- Wording, the exact definition-of-done checklist, and the open decisions listed for each phase.
- Rough size estimates for each phase, if they help.

## Amendment (2026-11-16): Azure on demand

Approved after the original design. The author has an Azure for Students account and wants hands-on Azure experience **without spending money**. An always-on live demo is ruled out: the system is deployed for a short demo and then deleted.

- **New Phase 5, "Azure on demand"**, after the MVP. The former Phases 5–9 become 6–10, unchanged apart from the Azure additions below.
  - `azd up` deploys the Aspire AppHost to Azure Container Apps (consumption plan) in one resource group. `azd down --purge` deletes it.
  - Managed services where a free offer covers them: Azure SQL Database (free serverless offer), Blob Storage, Key Vault (Auth0 and Stripe secrets), a container registry, and managed identity instead of connection-string secrets.
  - MongoDB locally, **Azure DocumentDB** (formerly Cosmos DB for MongoDB vCore, free tier) in Azure. Only the connection string differs. The free cluster can outlive `azd down`.
  - RabbitMQ locally, Azure Service Bus in Azure, to prove the messaging library hides the transport.
  - Redis and Mailpit run as containers in Container Apps (the managed versions cost money).
  - An Azure Function generates listing image thumbnails (Blob trigger). It also runs locally against Azurite.
  - A manually triggered GitHub Actions workflow (OIDC, no stored secret): deploy, smoke test, tear down.
  - Cost guards: a $1 budget alert, a teardown checklist, and "nothing left running" as a done-when item.
- **Phase 6 (Search):** Azure AI Vision tags and alt text for listing images, with tags feeding search facets. Azure AI Search moves from the parking lot to an optional comparison.
- **Phase 10 (Reviews, promotions, admin):** Azure AI Content Safety flags images and text into an admin moderation queue.
- **Rules:** local runs always use emulators or local containers. Azure AI services, which have no emulator, sit behind interfaces with a fake used when no key is configured. AKS stays in the parking lot with a cost warning (the free VMs are too small for its nodes). Retired Azure services from the student offer list are not used. Phase 5 should come soon after the MVP because the student credit and 12-month free services expire.
