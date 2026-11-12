# Frontend FSD restructure

## Goal

Bring `Clients/mc.market.reactwebapp/src` in line with Feature-Sliced Design:
every file sits in the layer and segment that matches its role, each slice
exposes a lean public API, and the ESLint config catches the violations that
pass lint today. Frontend only. There are no behaviour changes apart from the
one bug fix listed below.

## Audit findings (current state)

`npm run validate` and `npm run test` (95 tests) pass, but the code has these
FSD problems:

| # | Where | Problem |
|---|---|---|
| 1 | `pages/*.tsx` | Pages are flat files, not slices (no `ui/` segment, no `index.ts`). Lint treats `src/pages` as a single element, so page-to-page imports are not caught. |
| 2 | `entities/listing/store/*`, `api/useListingsQuery.ts` | The filter and sort search state is a use-case concern, not entity data. It sits in an entity only because `features/listing-filters` and `features/listing-sorters` cannot import each other. `store/` is also not a standard segment (it belongs in `model/`). |
| 3 | `widgets/filter-panel/ui/SearchButton.tsx` | A widget drives the entity store directly: a feature action leaking into a widget. |
| 4 | `features/listing-sorters` | Presentational only. It is controlled by the page and does no feature work by itself. |
| 5 | `features/visitor-session/lib/*` | `lib/` holds React providers, context and hooks (these belong in `model`), Auth0 env config (`config`), return-to URL logic and the provider that composes two entities. It is a catch-all slice. |
| 6 | `features/visitor-session/ui/HeaderAccountControls.tsx` | Imports from its own slice's public API (`@/features/visitor-session`), which creates a cycle. |
| 7 | `entities/listing/ui/ListingCard.tsx` | Imports from its own slice's public API (`@/entities/listing`), which creates a cycle. |
| 8 | `widgets/account-gate` | A route guard (`Navigate` / `Outlet`), not a UI block. Routing belongs in `app`. |
| 9 | `pages/VerifyEmail.tsx` and `widgets/account-gate/ui/EmailVerificationNotice.tsx` | The verify-email page content lives in a widget, and the "page" is only a redirect. |
| 10 | `widgets/trending-strip`, `categories-topics-strip`, `stats-strip` | Used only by Home. Under the "pages first" rule they belong in `pages/home`. |
| 11 | `widgets/header` and `widgets/mobile-nav` | One UI block split in two. The menu-open state and the nav-link rules live in `app/layouts/MainLayout`. |
| 12 | `entities/listing/model/types.ts` | Redeclares `Category`, which collides with `entities/category`'s `Category`, and exports it publicly. |
| 13 | `entities/session/lib/mapAccount.ts`, `entities/listing/store/ListingStoreProvider.tsx` | Deep imports into shared (`@/shared/lib/readJson`, `@/shared/lib/parseJson`) that bypass its public API. |
| 14 | `shared/index.ts` | One barrel for every segment. `readResponse` is re-exported under an alias (`readJsonResponse`). `parseJson.ts` contains `parsePositiveInteger`. |
| 15 | `shared/assets/*` | `icons.svg`, `react.svg` and `vite.svg` are unused. |
| 16 | Public APIs | They export internals and dead code: aliases (`mapListingPage`, `ListingParams`), `listingSearchBody`, `selectRelatedListings`, query keys, mappers, unused types (`OwnerProfile`, `PublicProfile`) and unused functions (`createCategory`, `getCategoryFullTree`, `flattenCategoryForest`). |
| 17 | Route paths | Hardcoded in four places: `routes.ts`, `MainLayout`, `HeaderAccountControls.protectedPaths` and `returnTo/paths.ts`. |
| 18 | `"MKT."` logo | Duplicated in `AuthLayout`, `SiteHeader` and `SiteFooter`. |
| 19 | Tests | `features/visitor-session/lib/__tests__` tests `entities/session` code (`mapAccount`, `sessionError`, `chrome`). |
| 20 | `app/providers/AppProviders.tsx` | The fallback branch for missing Auth0 config has no `QueryClientProvider`. Aspire always sets the Auth0 config, so this only affects running `npm run dev` on its own. The fix lifts `QueryClientProvider` above both branches at no extra cost. The file also has two import statements from the same module. |

## Decisions

- Listing search state moves into **one feature**, `features/listing-search`.
- Session and auth get a **full split** across `entities/session`,
  `shared/config`, `app` and `features/auth`.
- Widgets follow **pages first**: the home strips move into `pages/home`, and
  the header and mobile nav merge into `widgets/site-header`.
- **Per-segment public APIs for shared:** `@/shared/ui`, `@/shared/lib`,
  `@/shared/api` and `@/shared/config`. `@/shared` itself goes away.
- **Dead code is deleted**, not just unexported: unused functions and types,
  their tests and the unused assets. Git keeps the history.
- `Category` inside a listing becomes a local `ListingCategory` type (the
  listing's embedded snapshot). No `@x` cross-entity import is needed.
- `toVisitorSession` takes a `SessionProfile` type defined in
  `entities/session`. `CurrentUserMetadata` from `entities/profile` matches it
  structurally, so no cross-entity import is needed.
- Naming: slice folders use kebab-case, components use PascalCase files, and
  every slice's `index.ts` uses **named exports with relative paths**. Code
  inside a slice uses relative imports, and code across slices uses the `@/`
  alias plus the public API.

## Target structure

```text
src/
  app/
    main.tsx, App.tsx, styles.css
    providers/
      AppProviders.tsx        QueryClient wraps both branches (bug fix #20)
      SessionProvider.tsx     Auth0 + ensureCurrentUserMetadata -> session context
                              (was Auth0VisitorSessionProvider)
    routing/
      router.tsx              (was routes.ts) paths from shared/config
      AccountGate.tsx         (was widgets/account-gate) unverified -> VerifyEmailPage
    layouts/
      MainLayout.tsx          SiteHeader + Outlet only
      AuthLayout.tsx          uses shared/ui Logo

  pages/
    home/            ui/HomePage.tsx, ui/TrendingStrip.tsx,
                     ui/CategoriesStrip.tsx, ui/StatsStrip.tsx, index.ts
    browse/          ui/BrowsePage.tsx, ui/FilterPanel.tsx, index.ts
    listing-details/ ui/ListingDetailsPage.tsx, index.ts
    profile/         ui/ProfilePage.tsx, index.ts
    orders/          ui/OrdersPage.tsx, index.ts
    settings/        ui/SettingsPage.tsx, index.ts
    login/           ui/LoginPage.tsx, index.ts
    callback/        ui/CallbackPage.tsx, index.ts
    verify-email/    ui/VerifyEmailPage.tsx (was EmailVerificationNotice), index.ts

  widgets/
    site-header/     ui/SiteHeader.tsx (desktop bar), ui/MobileNav.tsx,
                     model/navLinks.ts, index.ts   owns menu state + nav links
    footer/          ui/SiteFooter.tsx, index.ts

  features/
    listing-search/
      model/   listingSearchStore.ts, ListingSearchProvider.tsx, context.ts,
               useListingSearchQuery.ts (was useListingsQuery; key keeps "listings" prefix)
      ui/      SearchFilter, CategoryFilter, ConditionFilter, PriceFilter,
               SortSelect (was SortDropdownButton, now reads/writes the store),
               SearchButton (was in widgets/filter-panel)
      index.ts
    auth/
      lib/     returnTo/{paths,storage,destination}.ts, authPageMode.ts, hostedLogin.ts
      ui/      AccountControls.tsx (was HeaderAccountControls)
      index.ts

  entities/
    listing/
      api/     listings.ts, useListingQuery.ts, useLatestListingsQuery.ts,
               useRelatedListingsQuery.ts
      model/   types.ts (ListingCategory), constants.ts, parse.ts
      lib/     listingImageUrl, listingLocationLabel, listingSearchBody,
               listingSku, selectRelatedListings
      ui/      ListingCard.tsx, ConditionBadge.tsx
      index.ts
    category/  api/, model/, index.ts   (dead code removed)
    profile/   api/, model/, index.ts   (dead types removed)
    session/
      model/   types.ts, context.ts, useVisitorSession.ts, toVisitorSession.ts
               (+ SessionProfile, ProfileLoadState, missingConfigSession),
               selectors.ts (was lib/sessionChrome.ts)
      lib/     mapAccount.ts, sessionError.ts
      index.ts

  shared/
    api/     readResponse.ts, httpError.ts, index.ts
    lib/     cx.ts, getInitials.ts, readJson.ts (type guards only),
             parsePositiveInteger.ts (was parseJson.ts), index.ts
    ui/      Button, Eyebrow, SectionHeader, StatusMessage, Avatar, Tabs,
             Logo (new), buttonClasses (internal, not exported), index.ts
    config/  auth0.ts (from visitor-session/lib/auth0.ts), routes.ts (new), index.ts
```

Tests move with the code they cover and use relative imports inside their
slice.

## Component details

### `shared/config/routes.ts`

```ts
export const routes = {
  home: "/",
  browse: "/browse",
  listing: (id: string) => `/listings/${id}`,
  profile: "/profile",
  orders: "/orders",
  settings: "/settings",
  verifyEmail: "/verify-email",
  login: "/login",
  callback: "/callback",
} as const;
export const accountPaths = [routes.profile, routes.orders, routes.settings] as const;
```

These replace the hardcoded paths in the router, the nav links,
`protectedPaths` and `returnTo/paths.ts` (finding #17). Route *patterns*, such
as `listings/:listingId`, stay in the router.

### Session (finding #5)

- `entities/session` owns the session *shape and access*: types, the
  `VisitorSessionContext`, a plain `SessionContextProvider({ session })`
  (was `ProvideVisitorSession`), `useVisitorSession`, `toVisitorSession`,
  `missingConfigSession`, the selectors and the mappers. It imports only from
  shared.
- `app/providers/SessionProvider.tsx` does the *wiring*. It reads `useAuth0`,
  calls `ensureCurrentUserMetadata` and feeds `toVisitorSession` into
  `SessionContextProvider`. It lives in `app` because it composes two entities
  and a vendor SDK.
- `features/auth` covers the *user actions*: sign in, sign up and sign out
  (`AccountControls`, `startHostedLogin`) and the return-to handling that they
  and the Login and Callback pages need.

### Account gate and verify-email (findings #8, #9)

`app/routing/AccountGate` keeps today's logic. While the session is
authenticating it shows a loading state. A guest is redirected to login with
`returnTo`. An unverified account sees `<VerifyEmailPage />` in place, and the
URL does not change. A verified account gets `<Outlet />`. The `/verify-email`
route element stays a `<Navigate to="/" replace />` defined in the router, so
a verified user who lands there is sent home. The user-visible behaviour is
unchanged.

### Site header (finding #11)

`widgets/site-header` exports one `SiteHeader` component. It owns the
`menuOpen` state, computes the nav links from the session (`showAccountNav`)
and `routes`, and renders the desktop bar plus `MobileNav`. `MainLayout`
renders only `<SiteHeader />`, the content wrapper and `<Outlet />`.

### Listing search (findings #2–#4)

- The store and provider are renamed to `ListingSearch*`. The state shape and
  actions stay as they are.
- `useListingSearchQuery()` is the old `useListingsQuery`. Its query key still
  starts with `"listings"`, so `SearchButton`'s `useIsFetching` keeps working.
- `SortSelect` reads `selectedSort` and calls `setSelectedSort` from the store.
  `BrowsePage` no longer passes those through.
- `pages/browse/ui/FilterPanel.tsx` composes the feature's filters and
  `SearchButton`.
- `entities/listing` exports `getListings` and `parseListingCondition` /
  `parseListingSort` for the feature to use.

### Public APIs (finding #16)

Each `index.ts` exports only what another slice imports. That excludes
mappers, query keys, `listingSearchBody`, `selectRelatedListings`,
`getListingById` (used only inside the slice) and any re-export alias. Tests
import internals through relative paths.

Deleted as dead code: `createCategory`, `CreateCategoryPayload`,
`getCategoryFullTree`, `flattenCategoryForest`, `CategoryFilterRow`,
`OwnerProfile`, `PublicProfile`, `shared/assets/*`, plus any tests that cover
only these.

## Lint hardening (`eslint.config.js`)

- `pages` captures `slice` (`src/pages/*`), so page-to-page imports are an
  error.
- `shared` captures `segment` (`src/shared/*`). Other layers may import shared
  only through `fileInternalPath: index.ts`. Files inside shared import each
  other freely.
- `widgets` / `features` / `entities` keep the existing rules. `app` may
  import `pages` only through their public API.
- Self-import through a slice's own public API (findings #6, #7): forbid it in
  lint if `eslint-plugin-boundaries` v7 supports matching on the captured
  slice. If it cannot, a grep check in verification enforces it, and the plan
  will say which approach was used.

## Documentation

Update the `README.md` layer table so it describes the new slices
(`features/auth`, `features/listing-search`, `widgets/site-header`,
`widgets/footer`), the per-segment shared imports and the "pages first" rule.

## Testing

This is a structural refactor with no new domain logic, so it needs no TDD.
The existing 95 tests are the safety net. They move with their code, and only
the tests for deleted dead code are removed (the two `flattenCategoryForest`
tests, which leaves 93). `toVisitorSession` gets a
`SessionProfile` parameter type, and its existing tests must pass unchanged.

## Verification

- `npm run validate`, `npm run test` and `npm run build` are green.
- These greps return nothing:
  - `from "@/shared"` (the bare barrel)
  - `from "@/shared/(ui|lib|api|config)/` outside `src/shared`
  - in each slice, an import from its own `@/<layer>/<slice>` alias
- A temporary page-to-page import fails lint. Revert it after the check.
- Run the app manually with Auth0 configured: Home, Browse (filters, sort,
  search, mobile panel), listing details, a missing listing, Login, and
  Profile / Orders / Settings while signed in.
- Run `npx steiger ./src` once, without adding it to `package.json`. Fix each
  finding or record it in the final report as an accepted exception with a
  reason. Judgement calls such as `insignificant-slice` on `entities/profile`
  need the user's decision before they are accepted.

## Out of scope

- Visual or copy changes, and replacing mock data on Profile, Orders and
  Settings.
- Splitting large page files (Settings, ListingDetails) into more `ui/` files.
- The repeated "accent line + eyebrow" hero label markup (Home, Login,
  verify-email). Noted as a follow-up.
