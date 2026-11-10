# Frontend cleanup: bug fixes and shared UI

## Goal

Fix the confirmed bugs in the React storefront (`Clients/mc.market.reactwebapp`)
and remove the repeated markup and inline styles by adding a small `shared/ui`
layer on top of the existing Tailwind theme tokens. Frontend only: no backend
or API contract changes.

## Decisions (from review)

- **Frontend only.** The Catalog API stays as it is.
- **Price filter:** out of scope. `PriceFilter` keeps its unwired inputs and
  only gets the token/style cleanup.
- **Placeholder data:** hardcoded seller (`"John Doe"`) and location
  (`"United States"`) are replaced with an em dash (`—`) wherever the API has no
  value. The same applies to the detail page's `condition`, which the detail
  response does not return (today it falls back to a fake `"New"`).
- **Mock pages** (Profile, Orders, Settings): restyle only. Mock content stays.
- **Browse result count:** show `Page X of Y` from `pageIndex` / `totalPages`.
- **No new dependencies** (no `clsx`, `tailwind-merge`, Testing Library).

## Approach

Considered:

1. **Tokens + small `shared/ui` components** (chosen). Use the theme tokens
   that already exist in `styles.css` and extract the six patterns that repeat
   across pages into presentational components.
2. **Tokens + exported class-string constants** only. Less code, but callers
   still repeat structure (heading + link, status blocks, avatar fallback).
3. **Adopt a component kit** (e.g. shadcn/ui). Adds dependencies and a second
   design language for a ~5k-line app. Rejected.

## Part A: bug fixes

### A1. Failing unit tests (6)

- `entities/listing/api/__tests__/listings.test.ts`: the fixture item lacks
  `condition`, which `mapListingView` requires (it is part of
  `ListingCardViewDto`). Add `condition: "used"` (a valid `LISTING_CONDITIONS`
  value) to the fixture. The mapper is correct.
- `entities/category/api/__tests__/categories.test.ts` expects
  `Categories request failed (500)`. A2 changes `readResponse` to produce that
  format, so the test passes as written.

### A2. HTTP errors carry a status; 404 detection

- Add `HttpError extends Error` with a readonly `status: number` in
  `shared/lib/httpError.ts`. Export it and `isNotFoundError(error: unknown)`
  from `@/shared`.
- `readResponse` throws `new HttpError(status, \`${action} failed (${status})\`)`
  for non-OK responses.
- `ListingDetails` uses `isNotFoundError(error)` instead of comparing
  `error.message === "Not Found"`, which never matches today.

### A3. Listing detail fetch follows the API-client rules

- Add `mapListing(body: unknown): Listing` in `entities/listing/api/listings.ts`
  that validates the detail payload with the `readJson` helpers, and throws
  `Invalid listing` on bad data. `condition`, `sellerRating` and `sellerSales`
  become `T | null` (absent from the API today → `null`).
- `getListingById(id, signal?)` takes an `AbortSignal` and returns
  `mapListing(await readResponse(...))` instead of casting `as Listing`.

### A4. Query hooks in the entity layer

Following the `useXQuery` + key-factory convention:

| Hook | Slice | Replaces |
|---|---|---|
| `useListingQuery(id)` | `entities/listing/api` | inline `useQuery` in `ListingDetails` (adds `enabled: Boolean(id)` instead of `id!`) |
| `useRelatedListingsQuery(listing)` | `entities/listing/api` | inline "related" query in `ListingDetails` |
| `useLatestListingsQuery(pageSize)` | `entities/listing/api` | `useEffect` + `AbortController` fetch in `TrendingStrip` |
| `useRootCategoriesQuery()` | `entities/category/api` | `useEffect` fetch in `CategoriesTopicsStrip`; `CategoryFilter`'s roots query reuses it (same `["categories"]` key) |

### A5. Listings query key includes `condition`

`listingsQueryKey` adds `applied.condition`. `searchId` stays (it forces a
refetch on every Search click by design).

### A6. Related listings

- `useRelatedListingsQuery(listing)` requests `getListings({ categoryId:
  listing.categoryId, pageSize: 5 })`, drops the current listing, and keeps at
  most 4. It is disabled until the listing has loaded.
- In `ListingDetails`, the "More like this" section is **hidden** when the
  result is empty. Loading and error render a compact inline `StatusMessage`,
  not a full-viewport block.

### A7. Placeholder data

- `ListingCard`: the seller slot and the location line show `—`.
- `ListingDetails`: the seller block shows `—` for name and avatar, and
  `listingLocationLabel` returns `—` instead of `"United States"` when there
  is no location. `condition` shows `—` when null (both the chip and the
  Details row). `listingLocationLabel` moves to `entities/listing/lib`.
- `sellerInitials` is deleted (no callers remain; replaced by `getInitials`).

### A8. Browse counts and badges

- Subtitle: `Page {pageIndex} of {totalPages}` from the query data; `…` while
  pending; nothing on error.
- The mobile filter badge counts **applied** filters (`applied.categoryId`,
  `applied.condition`, `applied.searchText`), not the pending selections.
- The mobile panel's close button reads `Show results` (no stale count).
- `BrowseContent` is no longer exported.

## Part B: shared UI and tokens

### B1. Tokens (`app/styles.css`)

- Fonts: use the existing `--font-display` / `--font-mono` tokens via
  `font-display` / `font-mono`. Inline `"Outfit, sans-serif"` is removed (it is
  already the body font). `html, body` reads `var(--font-body)`,
  `var(--color-background)` and `var(--color-foreground)` instead of literals.
- Radius: Tailwind 4's default `rounded-xs` is `0.125rem` (2px), which matches
  every `borderRadius: "2px"`. Use `rounded-xs`; delete the unused
  `--radius: 2px` token. The Settings toggle's 10px/8px radii become
  `rounded-full`.
- Status colours: add `--color-success: #4caf82` and `--color-info: #5b8def`.
  Orders' status styles use `text-accent bg-accent/8` (Processing — accent is
  already `#f0c842`), `text-info bg-info/8` (In Transit), and
  `text-success bg-success/8` (Delivered). The Settings toggle uses
  `bg-primary` / `bg-border`.

**End state:** no `style={{ fontFamily … }}`, no `borderRadius` styles and no
hex colours in `.tsx` files. Inline `style` remains only where a value is
dynamic and not expressible as a class (none expected after this work; the
Orders chevron rotation becomes `rotate-180`).

### B2. `shared/ui` components

All are presentational and free of business vocabulary, use named exports, and
are re-exported from `@/shared`. They accept an optional `className` that is
**appended** (for layout: margins, width). There is no class-conflict merging,
so callers must not use it to override variant styles.

| Component | Props | Replaces |
|---|---|---|
| `Button` | `variant: "primary" \| "outline" \| "danger"` (default `primary`), `size: "sm" \| "md" \| "lg"` (default `md`), `type` defaults to `"button"`, other `<button>` props | ~15 hand-styled primary/outline buttons |
| `ButtonLink` | same `variant`/`size`, plus react-router `Link` props | primary-styled `Link`s (Home, ListingDetails) |
| `Eyebrow` | `as?: "p" \| "span" \| "h2" \| "h3" \| "div"` (default `p`), `children` | `text-[10px] tracking-[0.15em] uppercase` mono labels |
| `SectionHeader` | `title`, `action?: { to: string; label: string }` | heading + "See all →" in TrendingStrip, CategoriesTopicsStrip, ListingDetails |
| `StatusMessage` | `message`, `symbol?: string` (e.g. `∅`), `size?: "page" \| "block" \| "inline"` (default `block`), `children?` (actions) | ~10 loading/error/empty blocks |
| `Avatar` | `src?: string \| null`, `initials`, `size: "xs" \| "sm" \| "md" \| "lg" \| "xl"` | avatar-with-initials in header, Profile, Settings, reviews, seller block |
| `Tabs` | `items: { id: T; label: string }[]`, `value: T`, `onChange`, `disabled?` — underline style, `role="tablist"` / `role="tab"` / `aria-selected` | underline tabs in Profile and Login |

Size mappings that normalise small visual drift (accepted):

- `SectionHeader` title is always
  `text-[28px] sm:text-[34px] lg:text-[38px]` (ListingDetails used `sm:text-[32px]`).
- `StatusMessage` `page` = `min-h-[calc(100vh-56px)]` centred; `block` =
  `py-24` centred; `inline` = left-aligned `text-sm font-light` paragraph
  (used by the home strips and related listings).

Helpers in `shared/lib`:

- `cx(...parts: (string | false | null | undefined)[]): string` joins truthy
  class names.
- `getInitials(name?: string | null, email?: string | null): string`: two or
  more words → first and last initials; one word that is not an email → its
  first two letters; otherwise the email's local part (two letters); otherwise
  `"MC"`. Always uppercase. Replaces `profileInitials` (Profile),
  `accountInitials` (HeaderAccountControls), the inline logic in Settings and
  `sellerInitials`.

### B3. Entity UI

- `entities/listing/ui/ConditionBadge` (`export default`, takes
  `condition: ListingCondition | null`, renders `—` for null), used in
  `ListingCard` and `ListingDetails`.

### B4. Adoption

Every page, widget and feature UI file moves to the tokens and to the
components above where they apply. The Profile page keeps its own mock listing
card markup (its mock items have no real listing IDs, so `ListingCard` links
would 404), restyled with tokens and `ConditionBadge`.

### B5. Accessibility fixes in passing

- Settings `Field`: `<label htmlFor>` bound to the input via `useId`.
- Settings `Toggle`: `role="switch"`, `aria-checked`, `type="button"`, and an
  `aria-label` that matches the visible label.
- `PriceFilter` inputs get `aria-label="Minimum price"` / `"Maximum price"`.
- Every remaining raw `<button>` gets an explicit `type="button"`.

## Testing

Vitest runs in the `node` environment on `*.test.ts` only, and there is no
component test setup. Adding one would mean new dependencies, so:

- **TDD (pure logic):** `HttpError` / `readResponse` / `isNotFoundError`,
  `getInitials`, `cx`, `mapListing`, `listingLocationLabel`,
  `listingsQueryKey` (includes `condition`), and the related-listings selection
  (excludes the current listing, caps at 4) as a pure helper
  `selectRelatedListings(items, currentId)`.
- **No TDD (presentational):** `shared/ui` components, `ConditionBadge`, page
  restyling. These are verified by type-check, lint, build and grep checks.

## Verification

- `npm run validate` (type-check + lint) and `npm run test` are green, with 0
  failing tests.
- `npm run build` succeeds.
- `grep -rn "fontFamily\|borderRadius\|#[0-9a-fA-F]\{6\}" src --include=*.tsx`
  returns nothing.
- Manual check in the running app (`aspire run`): Home, Browse (filters,
  pagination text, mobile panel), a listing detail page, a non-existent listing
  ID (shows "Listing not found"), Profile, Orders, Settings, and Login look
  unchanged apart from the intentional changes above.

## Out of scope

- Price filtering, seller/location/condition data and total counts in the API.
- Replacing the mock data on Profile, Orders and Settings.
- Narrowing `useListingStoreState()` selectors (a re-render optimisation, not a
  bug).
- Pagination controls on Browse (only the "Page X of Y" text).
