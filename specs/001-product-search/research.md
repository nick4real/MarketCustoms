# Research: Product Search and Enhanced View

## Decision 1: Make discovery server-backed

**Decision**: Extend the catalog API query model so the browse page can request
filtered product pages by name and product parameters.

**Rationale**: The current browse page loads only one page of products, so
client-only filtering would miss products outside that page and would not scale
cleanly as the catalog grows.

**Alternatives considered**:

- Filter only the currently loaded client page. Rejected because it would hide
  matching products that are not in memory.
- Fetch the entire catalog in the browser. Rejected because it increases load
  time and duplicates pagination work on the client.

## Decision 2: Expose parameter data in the product payloads

**Decision**: Include enough product metadata in catalog and detail responses to
render the richer product view and explain active filters.

**Rationale**: Users need to see what makes a product discoverable, and the
filter UI must reflect the same attributes used in search.

**Alternatives considered**:

- Hide parameter metadata from the UI. Rejected because parameter filtering
  would be opaque and harder to verify.
- Keep parameters only in the create payload. Rejected because browse and detail
  views would still lack the data needed for the feature.

## Decision 3: Preserve the existing browse route

**Decision**: Keep `/browse` as the discovery entry point and persist search
state in the URL.

**Rationale**: The app already uses `/browse?q=...` for product search, so
keeping that route reduces navigation churn and makes search/filter state easy
to share and restore.

**Alternatives considered**:

- Add a new discovery route. Rejected because it adds complexity without new
  user value.
