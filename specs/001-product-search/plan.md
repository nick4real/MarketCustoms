# Implementation Plan: Product Search and Enhanced View

**Branch**: `[001-product-search]` | **Date**: 2026-08-13 | **Spec**: `specs/001-product-search/spec.md`

**Input**: Feature specification from `/specs/001-product-search/spec.md`

## Summary

Improve the marketplace discovery flow by making the product catalog easier to
scan and by adding search and filters that work across the full catalog, not
just the currently loaded page. The implementation will extend the catalog API
query model and update the React browse/detail experience to show richer product
information, preserve search state in the URL, and keep the existing route
structure intact.

## Technical Context

**Language/Version**: TypeScript 6.0 on the React client; C# / .NET 10 on the
catalog API

**Primary Dependencies**: React 19, React Router 7, Vite, Auth0 React,
ASP.NET Core, MongoDB driver, EF Core, Mapster

**Storage**: MongoDB for product documents; relational database for categories

**Testing**: Existing frontend validation uses ESLint and TypeScript build; the
backend currently has no dedicated test project in repo

**Target Platform**: Modern desktop and mobile web browsers

**Project Type**: Web application with a React frontend and a separate catalog
API backend

**Performance Goals**: Search and filter results should update in under 1
second for typical catalog sizes; product browsing must remain responsive while
preserving pagination

**Constraints**: Preserve existing routes, authentication, and product detail
flow; do not rely on client-side filtering alone because the browse page only
loads a page of catalog data today

**Scale/Scope**: Single marketplace catalog experience spanning one web client
and one catalog service

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Code quality: scoped changes, no unrelated refactors, reuse existing catalog
  and browse patterns.
- Testing: plan includes automated validation for API query behavior and UI
  states; changes must remain buildable with existing project tooling.
- UX consistency: keep `/browse` as the discovery route, preserve empty/loading
  states, and extend the current card/detail presentation rather than replacing
  it.
- Performance: favor server-backed filtering and paginated responses so search
  works across the catalog without loading everything into the client.
- Reliability: keep the current catalog API contract stable where possible and
  extend it in a backward-compatible way.

## Project Structure

### Documentation (this feature)

```text
specs/001-product-search/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
Clients/mc.market.reactwebapp/
├── models/
├── src/
│   ├── api/
│   ├── components/
│   ├── layouts/
│   ├── lib/
│   └── pages/
└── package.json

Services/Catalog/
├── MC.Catalog.API/
├── MC.Catalog.Application/
├── MC.Catalog.Domain/
└── MC.Catalog.Infrastructure/
```

**Structure Decision**: This is a two-surface web feature: the React client in
`Clients/mc.market.reactwebapp/` will provide the updated browse and detail UX,
while the catalog API under `Services/Catalog/` will own searchable product
queries and richer product data.

## Phase 0: Research Output

### `research.md`

- Server-backed filtering is preferred so name and parameter search work across
  the full catalog instead of only the first loaded page.
- Product detail and catalog responses must expose enough product metadata to
  render the enhanced view and explain active filters.
- The existing `/browse` route and query-string search state should be
  preserved to minimize UX disruption.

## Phase 1: Design Output

### `data-model.md`

- Defines product catalog items, detailed products, search criteria, and
  parameter filters.
- Captures validation rules for trimmed, case-insensitive text search and
  conjunctive parameter filtering.

### `contracts/catalog-api.md`

- Documents the updated catalog query contract used by the browse page.
- Describes the product detail payload needed for the richer product view.

### `quickstart.md`

- Documents the build and manual smoke-check flow for browse, search, filter,
  empty-state, and detail-page behavior.

## Complexity Tracking

No constitution violations require justification.
