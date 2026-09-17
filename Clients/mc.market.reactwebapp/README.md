# MarketCustoms web app

The storefront follows [Feature-Sliced Design](https://feature-sliced.design/):

```text
src/
  app/          Bootstrap, providers, router, layouts, global styles
  pages/        Route-level screens (composition only)
  widgets/      Composite shell UI (header, mobile nav)
  features/     User interactions (visitor session, account gate, header auth)
  entities/     Domain models, gateway API clients, entity UI
  shared/       Assets and cross-cutting utilities (no business vocabulary)
```

Import direction: `app` → `pages` / `widgets` / `features` → `entities` → `shared`. Slices expose a public API via `index.ts`.

## Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
```

The app talks to the backend through the `/api` gateway proxy configured in `vite.config.ts`. Auth0 is enabled when `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` are present.
