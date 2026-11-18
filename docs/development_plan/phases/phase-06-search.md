# Phase 6: Search

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** fast, relevant listing search.

**User story:** as a buyer, I type "red bike" and get relevant results with filters (category, price range, condition, location) and suggestions as I type.

**Services touched:** Catalog (or a new search component inside it), web client (`browse` page).

**Scope:**

- Elasticsearch in the AppHost and the cluster.
- An index of active listings, kept in sync from listing events (created, updated, status changed, stock changed) via RabbitMQ, plus a full reindex command.
- Full-text search with relevance tuning, facets (aggregations), price ranges, autocomplete (completion suggester or `search_as_you_type`).
- The `browse` page uses the new search. MongoDB stays the system of record.
- **Azure AI Vision** (free F0 tier): when an image is uploaded, generate tags and an alt-text caption. Tags are stored on the listing and indexed as a facet; the caption becomes the image `alt` text. Behind an interface with a fake when no key is configured.
- Optional: index the same listings into **Azure AI Search** (free tier) and compare relevance, features and developer experience with Elasticsearch in an ADR.

**Out of scope:** personalised ranking, replacing Elasticsearch with Azure AI Search.

**New technology:** Elasticsearch, Azure AI Vision, Azure AI Search (optional).

**Open decisions:** client library (`Elastic.Clients.Elasticsearch`); index mapping per category parameters; how the index is kept consistent after missed events; whether AI tags are suggestions the seller confirms or are applied automatically.

**Done when:**

- [ ] Search returns results with facet counts and suggestions under 200 ms locally.
- [ ] Editing a listing shows up in search within a few seconds.
- [ ] Rebuilding the index from MongoDB works from one command.
- [ ] Uploading a photo of a bike adds a "bicycle" tag that can be used as a search facet.
