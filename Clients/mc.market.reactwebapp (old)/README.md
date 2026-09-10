# MarketCustoms web app

The storefront follows a feature-first structure based on Bulletproof React:

```text
src/
  app/          Application bootstrap, providers, router, layouts, and styles
  features/     Domain slices such as auth and listings
  pages/        Route-level composition only
  shared/       Cross-feature UI and utilities
  assets/       Static frontend assets
```

Feature code owns its API clients, components, domain types, and behavior. Pages compose feature APIs without reaching into another feature's internals. Application wiring lives under `app`, so the entry point remains a small React bootstrap.

## Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
```

The app talks to the backend through the `/api` gateway proxy configured in `vite.config.ts`. Auth0 is enabled when `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` are present.
