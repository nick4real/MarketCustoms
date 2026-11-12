# Frontend FSD restructure: implementation plan

Spec: `docs/superpowers/specs/2026-11-11-fsd-restructure-design.md` (approved).
Root for every path below: `Clients/mc.market.reactwebapp/`.

## Ground rules (all tasks)

- **Sequential.** Every task rewrites imports across the tree, so the tasks
  can't run in parallel without conflicts.
- **Each task leaves the tree green:** `npm run validate` and `npm run test`
  pass. The test count is 95 until Task 3 and 93 after it.
- Move files with `git mv` so history follows them. No commits.
- Inside a slice, use relative imports. Across slices, use `@/<layer>/<slice>`
  (the public API). Shared is imported only as `@/shared/<segment>`.
- Slice `index.ts` files use named exports with relative paths. Components
  inside slices use named exports, and `export default` is removed.
- **TDD: none.** This is a structural refactor with no new domain logic, and
  the existing tests are the safety net (see the spec's Testing section).
- No visual or copy changes.

---

## Task 1: Split shared into segment public APIs and add config and Logo

**Files**
- Create `src/shared/api/readResponse.ts` (move `readResponse` out of
  `src/shared/lib/readJson.ts`).
- Move `src/shared/lib/httpError.ts` to `src/shared/api/httpError.ts`.
- Create `src/shared/api/index.ts`, exporting `readResponse`, `HttpError` and
  `isNotFoundError`.
- `src/shared/lib/readJson.ts` keeps only the `read*` type guards.
- Rename `src/shared/lib/parseJson.ts` to
  `src/shared/lib/parsePositiveInteger.ts`.
- Create `src/shared/lib/index.ts`, exporting `cx`, `getInitials`, the `read*`
  guards and `parsePositiveInteger`.
- Create `src/shared/ui/index.ts`, exporting `Button`, `ButtonLink`, `Eyebrow`,
  `SectionHeader`, `StatusMessage`, `Avatar`, `Tabs` and `Logo`. It does not
  export `buttonClasses` or the size and variant types.
- Create `src/shared/ui/Logo.tsx` with the "MKT." markup. It takes a
  `className` for the size differences between `AuthLayout`, `SiteHeader` and
  `SiteFooter`, and is used in those three files.
- Create `src/shared/config/routes.ts` (`routes` and `accountPaths`, as in the
  spec).
- Move `src/features/visitor-session/lib/auth0.ts` to
  `src/shared/config/auth0.ts`, using `routes.callback` and `routes.home`.
- Create `src/shared/config/index.ts`.
- Delete `src/shared/index.ts` and `src/shared/assets/` (all three files).
- Move `src/shared/lib/__tests__/httpError.test.ts` to
  `src/shared/api/__tests__/`, with relative imports.
- Rewrite every `@/shared` and `@/shared/lib/...` import in `src/**` to the
  segment APIs.
- Rename the alias `readJsonResponse` to `readResponse` at every call site.

**Verify**
- `npm run validate`
- `npm run test` (95 pass)
- `grep -rnE 'from "@/shared"|from "@/shared/(ui|lib|api|config)/' src --include=*.ts --include=*.tsx | grep -v '^src/shared/'`
  returns nothing.

**Review focus:** no behaviour change; the Logo renders the same markup in all
three places.

---

## Task 2: Turn pages into slices and move the Home strips into pages/home

**Files**
- Turn each `src/pages/X.tsx` into `src/pages/<slice>/ui/<X>Page.tsx` plus
  `src/pages/<slice>/index.ts`, with a named export. The slices are `home`,
  `browse`, `listing-details`, `profile`, `orders`, `settings`, `login`,
  `callback` and `verify-email`. `VerifyEmail.tsx` moves for now and is
  replaced in Task 5.
- Move `src/widgets/trending-strip/ui/TrendingStrip.tsx` to
  `src/pages/home/ui/TrendingStrip.tsx`.
- Move `src/widgets/categories-topics-strip/ui/CategoriesTopicsStrip.tsx` to
  `src/pages/home/ui/CategoriesStrip.tsx`.
- Move `src/widgets/stats-strip/ui/SiteStatisticsStrip.tsx` to
  `src/pages/home/ui/StatsStrip.tsx`.
- Delete the three widget folders.
- Update `src/app/routes.ts` to import pages from their public APIs.

**Verify**
- `npm run validate`
- `npm run test` (95 pass)
- `ls src/pages` shows only folders.

**Review focus:** the markup moves unchanged; the pages are imported only
through `index.ts`.

---

## Task 3: Clean up the entities (listing, category, profile, session)

**Files**
- `src/entities/listing/ui/ListingCard.tsx`:
  - Use relative imports (removes the self public-API import).
  - Replace the template string with `cx`.
  - Use a named export.
- `src/entities/listing/ui/ConditionBadge.tsx`: use a named export.
- `src/entities/listing/model/types.ts`: rename `Category` to
  `ListingCategory` and use it in `Listing.category`. Use relative imports
  inside the slice.
- `src/entities/listing/api/listings.ts`: use relative imports.
- `src/entities/listing/index.ts`: export only the symbols used outside the
  slice. Remove `Category`, the `ListingParams` alias, `mapListingPage`,
  `listingSearchBody`, `selectRelatedListings`, `getListingById` and the query
  keys. Add `parseListingCondition` and `parseListingSort` (the feature needs
  them in Task 4). The store exports stay until Task 4.
- `src/entities/category`:
  - Delete `lib/flattenCategoryForest.ts`.
  - Delete `createCategory`, `CreateCategoryPayload` and
    `getCategoryFullTree`.
  - Trim `index.ts` to `Category`, `CategoryNode`, `getCategoryById`,
    `getCategoryWithChildren` and `useRootCategoriesQuery`.
  - Remove the two `flattenCategoryForest` tests from
    `api/__tests__/categories.test.ts`.
- `src/entities/profile`: delete the `OwnerProfile` and `PublicProfile` types.
  `index.ts` exports `CurrentUserMetadata` and `ensureCurrentUserMetadata`.
  Its test switches to a relative import.
- `src/entities/session`:
  - Move `lib/sessionChrome.ts` to `model/selectors.ts`.
  - `lib/mapAccount.ts` imports from `@/shared/lib`.
  - Move `mapAccount.test.ts`, `sessionError.test.ts` and `chrome.test.ts`
    from `src/features/visitor-session/lib/__tests__/` into
    `src/entities/session/{lib,model}/__tests__/`, with relative imports.

**Verify**
- `npm run validate`
- `npm run test` (93 pass)
- `grep -rn 'from "@/entities/listing"' src/entities/listing` returns nothing.

**Review focus:** every removed export really has no outside caller; the test
count drops by exactly 2.

---

## Task 4: Add features/listing-search

**Files**
- Create `src/features/listing-search/model/`:
  - `listingSearchStore.ts`, from `src/entities/listing/store/listingStore.ts`,
    renamed `ListingSearchState` / `createListingSearchStore` /
    `useListingSearchState` / `useListingSearchActions`.
  - `context.ts`, from `listingStoreContext.ts`.
  - `ListingSearchProvider.tsx`, from `ListingStoreProvider.tsx`.
  - `useListingSearchQuery.ts`, from
    `src/entities/listing/api/useListingsQuery.ts`. Its key still starts with
    `"listings"`.
- Move `useListingsQuery.test.ts` to
  `src/features/listing-search/model/__tests__/`.
- Create `src/features/listing-search/ui/`:
  - `SearchFilter`, `CategoryFilter`, `ConditionFilter` and `PriceFilter`,
    from `features/listing-filters/ui`.
  - `SortSelect.tsx`, from `features/listing-sorters/ui/SortDropdownButton.tsx`.
    It now reads `selectedSort` (default `"dateDesc"`) and calls
    `setSelectedSort` itself.
  - `SearchButton.tsx`, from `widgets/filter-panel/ui`.
- Create `src/features/listing-search/index.ts`, exporting
  `ListingSearchProvider`, `useListingSearchState`, `useListingSearchQuery`,
  the filters, `SortSelect` and `SearchButton`.
- Create `src/pages/browse/ui/FilterPanel.tsx`, from
  `widgets/filter-panel/ui/FilterPanel.tsx`.
- `BrowsePage` uses the feature and renders `<SortSelect />` with no props.
- Delete `src/entities/listing/store/`, `src/features/listing-filters`,
  `src/features/listing-sorters` and `src/widgets/filter-panel`.
- Remove the store exports from `src/entities/listing/index.ts`.

**Verify**
- `npm run validate`
- `npm run test` (93 pass)
- `grep -rn "store" src/entities` returns nothing.

**Review focus:** the state shape and actions are unchanged; the URL params
are parsed the same way; Search is still disabled while a `["listings"]` fetch
is running.

---

## Task 5: Split session and auth (entities/session, app, features/auth)

**Files**
- Create `src/entities/session/model/`:
  - `context.ts`: `VisitorSessionContext`, and `SessionContextProvider`, which
    was `ProvideVisitorSession`. Write it as JSX, not `createElement`.
  - `useVisitorSession.ts`.
  - `toVisitorSession.ts`, from `visitorSessionView.ts`. It defines
    `SessionProfile = { id; displayName; pictureUrl; accountType }` and uses it
    in place of `CurrentUserMetadata`. It also holds `ProfileLoadState` and
    `missingConfigSession`.
- Move `useVisitorSession.test.ts`, which tests `toVisitorSession`, into
  `src/entities/session/model/__tests__/`.
- Update `src/entities/session/index.ts`.
- Create `src/app/providers/SessionProvider.tsx` from
  `Auth0VisitorSessionProvider`. Its logic is unchanged.
- `src/app/providers/AppProviders.tsx`:
  - Lift `QueryClientProvider` above both branches.
  - Merge the duplicate imports.
  - Import `savePostSignInReturnTo` from `@/features/auth` and the Auth0
    options from `@/shared/config`.
- Move `src/app/routes.ts` to `src/app/routing/router.tsx` and use `routes`
  from `@/shared/config` for the static paths. The `verify-email` route
  element is `<Navigate to={routes.home} replace />`.
- Create `src/app/routing/AccountGate.tsx` from
  `widgets/account-gate/ui/AccountGate.tsx`. It renders `<VerifyEmailPage />`
  from `@/pages/verify-email` for unverified accounts, and builds the login
  URL from `routes`.
- Replace `src/pages/verify-email/ui/VerifyEmailPage.tsx` with the content of
  `EmailVerificationNotice.tsx`.
- Delete `src/widgets/account-gate`.
- Create `src/features/auth/`:
  - `lib/returnTo/{paths,storage,destination,index}.ts`. In `paths.ts`, the
    exact paths come from `routes` and `accountPaths`.
  - `lib/authPageMode.ts` and `lib/hostedLogin.ts`.
  - `ui/AccountControls.tsx`, from `HeaderAccountControls.tsx`:
    - Relative imports inside the slice.
    - `protectedPaths` is replaced by `accountPaths`.
    - The login href is built from `routes.login`.
  - `index.ts`.
- Move the remaining tests (`afterSignIn`, `authPageMode`,
  `postSignInReturnTo`, `returnTo`) to `src/features/auth/lib/__tests__/`.
- Update `LoginPage`, `CallbackPage`, `ProfilePage`, `SettingsPage`,
  `MainLayout`, `SiteHeader` and `MobileNav` to the new imports.
- Delete `src/features/visitor-session`.

**Verify**
- `npm run validate`
- `npm run test` (93 pass)
- `grep -rn "visitor-session\|account-gate" src` returns nothing.

**Review focus:**
- The gate behaves exactly as before: authenticating, guest redirect,
  unverified account in place, verified `Outlet`.
- `SessionProvider` logic is identical.
- `entities/session` imports only from shared.

---

## Task 6: Merge header and mobile nav into widgets/site-header

**Files**
- Create `src/widgets/site-header/`:
  - `ui/SiteHeader.tsx`, from `widgets/header`. It owns the `menuOpen` state
    and renders `MobileNav`. It uses `cx` instead of template strings.
  - `ui/MobileNav.tsx`, from `widgets/mobile-nav`.
  - `model/navLinks.ts`: `getNavLinks(session)`, built from `routes` and
    `showAccountNav`. The logic moves out of `MainLayout`.
  - `index.ts`, exporting `SiteHeader`.
- Delete `src/widgets/header` and `src/widgets/mobile-nav`.
- `src/widgets/footer`: named export, relative index.
- `src/app/layouts/MainLayout.tsx` keeps only `<SiteHeader />`, the `pt-14`
  wrapper and `<Outlet />`.

**Verify**
- `npm run validate`
- `npm run test` (93 pass)

**Review focus:**
- The menu closes on navigation and on a logo click.
- The nav links match the old rules (Browse always; Orders, Profile and
  Settings only when `showAccountNav`).

---

## Task 7: Harden lint and update the README

**Files**
- `eslint.config.js`:
  - `pages` element: `src/pages/*` with `capture: ["slice"]`.
  - `shared` element: `src/shared/*` with `capture: ["segment"]`. Inside
    shared, files import each other freely. Every other layer may import
    shared only with `fileInternalPath: "index.{ts,tsx}"`.
  - `app` imports pages only through their public API.
  - Try a boundaries rule that forbids a slice importing its own public API
    (matching on the captured `slice`). If `eslint-plugin-boundaries` v7 can't
    express it, add a comment and rely on the grep in Task 8, and say so in the
    report.
- Update the layer table and rules in `README.md`, as described in the spec.

**Verify**
- `npm run validate` passes.
- A temporary import of `@/pages/home` inside `src/pages/browse/ui/BrowsePage.tsx`
  makes `npm run lint` fail. Revert it.
- A temporary import of `@/shared/ui/Button` from a page makes lint fail.
  Revert it.

**Review focus:** the rules are not loosened anywhere compared with today.

---

## Task 8: Final verification and Steiger

Run by `test-runner`. I check the results myself.

- `npm run validate`, `npm run test` (93 pass) and `npm run build`.
- The spec's grep checks:
  - The bare `@/shared` barrel and deep shared imports outside shared.
  - Self public-API imports: for each slice folder `src/<layer>/<slice>`,
    `grep -rn 'from "@/<layer>/<slice>"' src/<layer>/<slice>` is empty.
  - No hardcoded `"/profile"`, `"/orders"` or `"/settings"` strings outside
    `src/shared/config/routes.ts`.
- `npx steiger ./src`, with nothing added to `package.json`. Each finding is
  either fixed (which loops back to the task that owns it) or reported. Report
  judgement calls such as `insignificant-slice` to the user before accepting
  them.
- Manual: `aspire run`, then Home, Browse (filters, sort, search, mobile
  panel), listing details, a missing listing ID, Login, sign in, and Profile,
  Orders and Settings. Also an unverified account, if one is available.

## Final report

It covers the changed files (`git status`), the command output, the Steiger
results and any accepted exceptions. No commit.
