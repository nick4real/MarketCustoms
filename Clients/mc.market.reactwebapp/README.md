# MarketCustoms web app

The storefront follows [Feature-Sliced Design](https://feature-sliced.design/):

```text
src/
  app/        Bootstrap, providers, routing, layouts, global styles
  pages/      One slice per route: home, browse, listing-details, profile, orders,
              settings, login, callback, verify-email  (<slice>/ui + index.ts)
  widgets/    Composite shell UI: site-header, footer
  features/   User interactions: auth, listing-search
  entities/   Domain models, API clients, entity UI: listing, category, profile, session
  shared/     Business-agnostic code, split into segments: ui, lib, api, config
```

## Rules

- Import direction: `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`. Slices on the same layer never import each other.
- Pages first: code used by a single page lives in that page. Move it down a layer only when a second consumer appears.
- Public API: every slice exposes `index.ts` with named exports. Other layers import the slice root (`@/entities/listing`), never its internals.
- Shared segments are imported by segment root: `@/shared/ui`, `@/shared/lib`, `@/shared/api`, `@/shared/config`. Inside `shared`, files may import each other freely.
- Inside a slice or segment use relative imports (never the slice's own `@/...` root).

Boundaries, including self-imports through a slice's own `@/` alias, are enforced by `eslint.config.js` (`npm run lint`).

## Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
```

The app talks to the backend through the `/api` gateway proxy configured in `vite.config.ts`. Auth0 is enabled when `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` are present.
