# Frontend Cleanup Implementation Plan

> **For agentic workers:** Execution follows the task-storm pipeline: one `react-coder` per task, then a `react-reviewer` on the working-tree diff (`git diff`). **No commits.** Steps use checkbox (`- [ ]`) syntax.

**Goal:** Fix the storefront's confirmed bugs and replace repeated markup and inline styles with theme tokens and a small `shared/ui` layer.

**Architecture:** Shared helpers (`HttpError`, `cx`, `getInitials`) come first. Then `shared/ui` components and the theme tokens, in parallel with the listing/category entity changes (mapper, query hooks, `ConditionBadge`). Finally, five disjoint groups of pages and widgets adopt them in parallel.

**Tech Stack:** React 19, TypeScript (strict, `verbatimModuleSyntax`), Vite, Tailwind CSS 4, TanStack Query 5, Zustand 5, React Router 8, Vitest 4 (node env, `src/**/__tests__/**/*.test.ts`).

**Spec:** `docs/superpowers/specs/2026-11-10-frontend-cleanup-design.md`

All paths below are relative to `Clients/mc.market.reactwebapp/`. All commands run from that folder.

## Global Constraints

- Frontend only; no API contract changes.
- No new dependencies.
- No commits. Each task ends by listing its changed files.
- FSD: imports go downward only. Other layers import a slice only through its root (`@/shared`, `@/entities/listing`). Inside a slice, use relative imports.
- `shared/ui` components: named exports, re-exported from `src/shared/index.ts`, optional `className` **appended** via `cx` (layout only, no override merging).
- Placeholder for missing data: `—` (em dash, U+2014).
- Radius: `rounded-xs` (Tailwind 4 default = 2px). Fonts: `font-display`, `font-mono`; Outfit is the body default and needs no class.
- End state: `grep -rn "fontFamily\|borderRadius\|#[0-9a-fA-F]\{6\}" src --include=*.tsx` prints nothing.
- Every `<button>` has an explicit `type`.
- `PriceFilter` stays unwired (style and aria only).
- Mock content in Profile, Orders and Settings stays.

## Review Focus

1. **The API sends `Condition` as PascalCase** (`"Used"`: `JsonStringEnumConverter` with no naming policy). The UI type is lowercase. The mappers must normalise this, or the badges and filters disagree → Task 3 test `normalises a PascalCase condition`.
2. **A listing ID that 404s** must show "Listing not found", not the generic error → Task 1 test `isNotFoundError` and Task 4 manual check.
3. **A listing whose category holds only itself** → the related list is empty and the section is hidden → Task 3 test `returns empty when only the current listing matches`.
4. **A detail payload with `location: null` or all-blank location fields** → `—`, no stray commas → Task 3 tests on `listingLocationLabel`.
5. **Single-word or email-only display names** (`"alice"`, `"alice@x.io"`) in avatars → Task 1 tests on `getInitials`.

---

### Task 1: Shared helpers: `HttpError`, `cx`, `getInitials` (TDD)

**Files:**
- Create: `src/shared/lib/httpError.ts`, `src/shared/lib/cx.ts`, `src/shared/lib/getInitials.ts`
- Modify: `src/shared/lib/readJson.ts` (`readResponse`), `src/shared/index.ts`
- Modify (imports only): `src/entities/listing/api/listings.ts`, `src/entities/profile/api/profiles.ts`. Both switch from `@/shared/lib/readJson` to `@/shared` (`readJsonResponse`, `readStringNonEmpty`, …).
- Test: `src/shared/lib/__tests__/httpError.test.ts`, `cx.test.ts`, `getInitials.test.ts`

**Interfaces:**
- Produces:
  - `class HttpError extends Error { readonly status: number; constructor(status: number, message: string) }`, with `name = "HttpError"`
  - `isNotFoundError(error: unknown): boolean`
  - `readResponse` (exported from `@/shared` as `readJsonResponse`) throws `new HttpError(status, \`${action} failed (${status})\`)` on non-OK responses
  - `cx(...parts: (string | false | null | undefined)[]): string`
  - `getInitials(name?: string | null, email?: string | null): string`
  - All of the above are exported from `@/shared`.

- [ ] **Step 1: Write failing tests**

```ts
// httpError.test.ts
describe("readResponse", () => {
  it("throws an HttpError carrying the status", async () => {
    const err = await readResponse(new Response(null, { status: 404 }), "Listing request").catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(404);
    expect(err.message).toBe("Listing request failed (404)");
  });
  it("returns parsed json for ok responses", async () => {
    await expect(readResponse(new Response('{"a":1}', { status: 200 }), "X")).resolves.toEqual({ a: 1 });
  });
});
describe("isNotFoundError", () => {
  it("is true only for a 404 HttpError", () => {
    expect(isNotFoundError(new HttpError(404, "x"))).toBe(true);
    expect(isNotFoundError(new HttpError(500, "x"))).toBe(false);
    expect(isNotFoundError(new Error("Not Found"))).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
  });
});
// cx.test.ts
it("joins truthy class names with single spaces", () => {
  expect(cx("a", false, null, undefined, "", "b")).toBe("a b");
});
// getInitials.test.ts
it("uses first and last initials for multi-word names", () => expect(getInitials("Ada Byron Lovelace")).toBe("AL"));
it("ignores dots in abbreviated names", () => expect(getInitials("T. Berg")).toBe("TB"));
it("uses the first two letters of a single word", () => expect(getInitials("alice")).toBe("AL"));
it("falls back to the email local part when the name is an email", () => expect(getInitials("bob@x.io", "bob@x.io")).toBe("BO"));
it("falls back to the email when the name is missing", () => expect(getInitials(null, "carol@x.io")).toBe("CA"));
it("returns MC when nothing is usable", () => expect(getInitials("  ", null)).toBe("MC"));
```

- [ ] **Step 2: Run** `npx vitest run src/shared`. Expected: FAIL (modules not found).
- [ ] **Step 3: Implement** the three files, change `readResponse`, and add the exports and import switches listed above. In `getInitials`, strip `.` before splitting a name into words.
- [ ] **Step 4: Run** `npx vitest run src/shared src/entities/category`. Expected: PASS. The `categories.test.ts` `(500)` test now passes unchanged.
- [ ] **Step 5: Run** `npm run validate`. Expected: exits 0. Report the changed files.

---

### Task 2: Theme tokens and `shared/ui` components (no TDD: presentational)

Depends on Task 1 (`cx`).

**Files:**
- Modify: `src/app/styles.css`
- Create: `src/shared/ui/Button.tsx` (exports `Button`, `ButtonLink` and `buttonClasses`), `Eyebrow.tsx`, `SectionHeader.tsx`, `StatusMessage.tsx`, `Avatar.tsx`, `Tabs.tsx`
- Modify: `src/shared/index.ts`

**Interfaces:**
- Consumes: `cx` from Task 1.
- Produces (all from `@/shared`):
  - `type ButtonVariant = "primary" | "outline" | "danger"`; `type ButtonSize = "sm" | "md" | "lg"`
  - `buttonClasses({ variant, size }: { variant?: ButtonVariant; size?: ButtonSize }): string`
  - `Button(props: ComponentProps<"button"> & { variant?; size? })`, with `type` defaulting to `"button"`
  - `ButtonLink(props: ComponentProps<typeof Link> & { variant?; size? })`
  - `Eyebrow({ as = "p", className, children }: { as?: "p" | "span" | "h2" | "h3" | "div"; className?: string; children: ReactNode })`
  - `SectionHeader({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: { to: string; label: string }; className?: string })`. The subtitle renders as `p.text-muted-foreground.mt-1.5.text-sm.font-light` under the `h2`, both wrapped in a `div`.
  - `StatusMessage({ message, symbol, size = "block", className, children }: { message: string; symbol?: string; size?: "page" | "block" | "inline"; className?: string; children?: ReactNode })`
  - `type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl"`; `Avatar({ src, initials, size = "sm", className }: { src?: string | null; initials: string; size?: AvatarSize; className?: string })`
  - `Tabs<T extends string>({ items, value, onChange, disabled, className }: { items: readonly { id: T; label: string }[]; value: T; onChange: (id: T) => void; disabled?: boolean; className?: string })`

**Exact values (copy from the current markup):**
- `styles.css`:
  - Add `--color-success: #4caf82;` and `--color-info: #5b8def;`.
  - Delete `--radius: 2px;`.
  - Have `html, body` use `var(--color-background)`, `var(--color-foreground)` and `var(--font-body)`.
- Button base: `rounded-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40`.
  - Variants:
    - primary: `bg-primary text-primary-foreground hover:bg-primary-hover font-semibold`
    - outline: `border border-border-subtle text-foreground hover:border-border-emphasis font-medium`
    - danger: `border border-destructive/30 text-destructive hover:border-destructive/70`
  - Sizes:
    - sm: `px-3 py-2 text-xs`
    - md: `px-4 py-2 text-sm`
    - lg: `px-6 py-3 text-sm tracking-wide`
- Eyebrow: `text-muted-foreground font-mono text-[10px] tracking-[0.15em] uppercase`.
- SectionHeader: a `div.mb-8.flex.items-end.justify-between.lg:mb-10` containing:
  - an `h2` with `text-foreground font-display text-[28px] font-bold sm:text-[34px] lg:text-[38px]`
  - a `Link` with `text-muted-foreground hover:text-foreground ml-4 shrink-0 font-mono text-xs tracking-wide transition-colors`
- StatusMessage sizes:
  - `page`: a centred column, `bg-background flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center`
  - `block`: `flex flex-col items-center justify-center py-24 text-center`
  - `inline`: a single `<p class="text-muted-foreground text-sm font-light">` that ignores `symbol`
  - For `page`/`block`:
    - the symbol is a `div.text-border-subtle.font-display.mb-4.text-5xl`
    - the message is a `p.text-foreground-subtle.font-mono.text-xs.tracking-widest`
    - `children` render below the message with `mt-8`
- Avatar:
  - base: `rounded-full overflow-hidden flex shrink-0 items-center justify-center bg-secondary text-foreground-muted border border-border-subtle font-semibold`
  - sizes:
    - xs: `h-7 w-7 text-[10px]`
    - sm: `h-8 w-8 text-xs`
    - md: `h-10 w-10 text-xs`
    - lg: `h-16 w-16 text-sm`
    - xl: `h-20 w-20 text-lg md:h-24 md:w-24`
  - `<img alt="">` when `src` is set, otherwise initials in a `span.font-mono`
- Tabs:
  - a container with `role="tablist"` and `flex gap-8 border-b border-border`
  - each tab is a `button type="button" role="tab" aria-selected` with `border-b-2 pb-3 font-mono text-xs tracking-[0.15em] uppercase transition-colors`
  - selected tab: `border-primary text-foreground`
  - other tabs: `border-transparent text-muted-foreground hover:text-foreground-muted`

- [ ] **Step 1: Implement** the tokens and components above.
- [ ] **Step 2: Run** `npm run validate`. Expected: exits 0 (`react-refresh/only-export-components` may flag `buttonClasses` in `Button.tsx`; if it does, move `buttonClasses` to `src/shared/ui/buttonClasses.ts`).
- [ ] **Step 3: Run** `npm run build`. Expected: succeeds. Report the changed files.

---

### Task 3: Listing and category entities: mapper, hooks, `ConditionBadge` (TDD for logic)

Runs in parallel with Task 2. Depends on Task 1 (`readJsonResponse` from `@/shared`).

**Files:**
- Modify:
  - `src/entities/listing/model/types.ts`
  - `src/entities/listing/api/listings.ts`
  - `src/entities/listing/api/useListingsQuery.ts`
  - `src/entities/listing/ui/ListingCard.tsx`
  - `src/entities/listing/index.ts`
  - `src/entities/category/index.ts`
- Create:
  - `src/entities/listing/api/useListingQuery.ts`
  - `src/entities/listing/api/useRelatedListingsQuery.ts`
  - `src/entities/listing/api/useLatestListingsQuery.ts`
  - `src/entities/listing/lib/listingLocationLabel.ts`
  - `src/entities/listing/lib/selectRelatedListings.ts`
  - `src/entities/listing/ui/ConditionBadge.tsx`
  - `src/entities/category/api/useRootCategoriesQuery.ts`
- Test:
  - Modify: `src/entities/listing/api/__tests__/listings.test.ts`
  - Create: `src/entities/listing/lib/__tests__/listingLocationLabel.test.ts`, `src/entities/listing/lib/__tests__/selectRelatedListings.test.ts`, `src/entities/listing/api/__tests__/useListingsQuery.test.ts` (key factory only)

**Interfaces:**
- Produces (from `@/entities/listing` unless noted):
  - Types:
    - `interface ListingLocation { country: string | null; region: string | null; city: string | null }`
    - `Listing` fields that change: `location: ListingLocation | null; condition: ListingCondition | null; sellerRating: number | null; sellerSales: number | null` (the rest unchanged)
  - Mapper and fetcher:
    - `mapListing(body: unknown): Listing` (not exported from the slice root; used internally)
    - `getListingById(id: string, signal?: AbortSignal): Promise<Listing>`
  - Query keys:
    - `listingsQueryKey(applied)`: now includes `applied.condition` right after `applied.categoryId`
    - `listingQueryKey = (id: string) => ["listing", id] as const`
    - `relatedListingsQueryKey = (id: string, categoryId: number) => ["listings", "related", id, categoryId] as const`
    - `latestListingsQueryKey = (pageSize: number) => ["listings", "latest", pageSize] as const`
  - Query hooks:
    - `useListingQuery(id: string | undefined)`: `enabled: Boolean(id)`
    - `useRelatedListingsQuery(listing: Listing | undefined)`: `getListings({ categoryId, pageSize: 5 }, signal)`, then `selectRelatedListings(items, listing.id)`; `enabled: Boolean(listing)`; data is `ListingView[]`
    - `useLatestListingsQuery(pageSize: number)`: data is `ListingView[]`
  - Helpers:
    - `selectRelatedListings(items: ListingView[], currentId: string, limit = 4): ListingView[]`
    - `listingLocationLabel(location: ListingLocation | null): string`, which returns `"—"` when there are no non-blank parts
  - UI:
    - `ConditionBadge` (`export default`): `{ condition }: { condition: ListingCondition | null }`
      - renders `Capitalized` text or `—`
      - classes: `bg-secondary text-muted-foreground shrink-0 px-1.5 py-0.5 font-mono text-[10px]`
  - From `@/entities/category`:
    - `rootCategoriesQueryKey = () => ["categories"] as const`
    - `useRootCategoriesQuery()`: passes `signal` to `getRootCategories`
- Behaviour changes:
  - `mapListingView` and `mapListing` lowercase the condition before `parseListingCondition`. An unknown value throws (`Invalid listing view` / `Invalid listing`).
  - `ListingCard`:
    - uses `ConditionBadge`
    - shows `—` for the seller slot and the location line
    - uses `font-display`/`font-mono`/`rounded-xs`; no `style`
  - Keep the `sellerInitials` export for now (Task 4 deletes it).

- [ ] **Step 1: Write failing tests**

```ts
// listings.test.ts: add condition: "used" to the listingPage fixture item; then add:
describe("mapListingView", () => {
  it("normalises a PascalCase condition", () => {
    expect(mapListingView({ ...listingPage.items[0], condition: "Used" }).condition).toBe("used");
  });
  it("rejects an unknown condition", () => {
    expect(() => mapListingView({ ...listingPage.items[0], condition: "Mint" })).toThrow(/Invalid listing view/);
  });
});
describe("mapListing", () => {
  const detail = { id: "l1", ownerId: "o1", title: "Leica", description: "Film", categoryId: 3,
    category: { id: 3, name: "Cameras" }, location: { country: "JP", region: null, city: "Tokyo", district: null, latitude: 0, longitude: 0 },
    createdAt: "2026-08-01T00:00:00Z", price: 2400, stock: 1, images: ["p1"], tags: ["film"], parameters: [{ name: "Mount", value: "M" }] };
  it("maps a detail payload and defaults absent seller fields to null", () => {
    expect(mapListing(detail)).toMatchObject({ id: "l1", categoryId: 3, condition: null, sellerRating: null, sellerSales: null,
      location: { country: "JP", region: null, city: "Tokyo" } });
  });
  it("maps a null location to null", () => expect(mapListing({ ...detail, location: null }).location).toBeNull());
  it("rejects a payload without an id", () => expect(() => mapListing({ ...detail, id: "" })).toThrow(/Invalid listing/));
});
describe("getListingById", () => {
  it("passes the abort signal and maps the body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(detail));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    await expect(getListingById("l1", signal)).resolves.toMatchObject({ id: "l1" });
    expect(fetchMock).toHaveBeenCalledWith("/api/listings/l1", { signal });
  });
});
// listingLocationLabel.test.ts
it("joins city, region and country", () => expect(listingLocationLabel({ city: "Tokyo", region: "Kanto", country: "JP" })).toBe("Tokyo, Kanto, JP"));
it("skips blank parts", () => expect(listingLocationLabel({ city: " ", region: null, country: "JP" })).toBe("JP"));
it("returns a dash when nothing is set", () => { expect(listingLocationLabel(null)).toBe("—"); expect(listingLocationLabel({ city: "", region: null, country: null })).toBe("—"); });
// selectRelatedListings.test.ts
it("excludes the current listing and caps at 4", () => { /* 6 items incl. current → 4 items, none with currentId, order preserved */ });
it("returns empty when only the current listing matches", () => expect(selectRelatedListings([view("a")], "a")).toEqual([]));
// useListingsQuery.test.ts
it("includes condition in the listings query key", () => {
  expect(listingsQueryKey({ ...applied, condition: "used" })).toContain("used");
  expect(listingsQueryKey({ ...applied, condition: "used" })).not.toEqual(listingsQueryKey({ ...applied, condition: null }));
});
```

Keep the existing `mapListingPage` and `getListings` tests and their assertions. Only the fixture changes.

- [ ] **Step 2: Run** `npx vitest run src/entities`. Expected: the new tests FAIL, and the 5 previously failing listing tests now PASS.
- [ ] **Step 3: Implement** the interfaces above. `mapListing` validates with `readStringNonEmpty` / `readFiniteNumber` / `readPositiveInt`:
  - `category` must be `{ id, name }`
  - `images` and `tags` keep only non-empty strings
  - `parameters` keeps only entries whose name and value are both strings
- [ ] **Step 4: Run** `npx vitest run src/entities`. Expected: all PASS.
- [ ] **Step 5: Run** `npm run validate`. Expected: exits 0. `ListingDetails.tsx` still compiles against the new `Listing` type: `?? "New"` and `?.toFixed` both accept `null`. Report the changed files.

---

### Tasks 4–8 run in parallel after Tasks 2 and 3. Their file sets are disjoint.

The common rule for every file in Tasks 4–8:
- Replace inline `fontFamily` with `font-display` / `font-mono`, or drop it (Outfit).
- Replace `borderRadius: "2px"` with `rounded-xs`.
- Use the `shared/ui` components wherever the pattern matches.
- Give every `<button>` a `type`.
- Run `npm run validate` and `npm run test` as the final step. Expected: both exit 0.
- Run `grep -n "style=" <task files>`. Expected: no matches.
- Report the changed files.

### Task 4: `ListingDetails` page

**Files:**
- Modify: `src/pages/ListingDetails.tsx`, `src/entities/listing/index.ts`
- Delete: `src/entities/listing/lib/sellerInitials.ts`

**Interfaces:**
- Consumes:
  - `useListingQuery`, `useRelatedListingsQuery`, `listingLocationLabel`, `ConditionBadge`, `ListingCard`
  - `isNotFoundError`, `ButtonLink`, `Button`, `Eyebrow`, `SectionHeader`, `StatusMessage`, `Avatar`

- [ ] **Step 1:** Replace both inline `useQuery` calls with `useListingQuery(listingId)` and `useRelatedListingsQuery(listing)`.
- [ ] **Step 2:** Rework the state handling:
  - order: `isNotFoundError(error)` → `<StatusMessage size="page" symbol="∅" message="Listing not found">` with `<ButtonLink to="/browse" size="lg">Back to Browse</ButtonLink>`
  - then pending → `StatusMessage size="page" message="Loading..."`
  - then any other error → `symbol="Whoops!" message="Error loading listing"`
  - remove the unreachable `!listing` branch
- [ ] **Step 3:** Placeholders and condition:
  - The seller block shows `<Avatar size="md" initials="—" />` and the name `—`.
  - Location uses `listingLocationLabel(listing.location)`.
  - Condition uses `<ConditionBadge condition={listing.condition} />` in the chip row.
  - The Details "Condition" row shows `listing.condition` capitalised or `—`.
  - Rating and sales keep the `?? "—"` fallbacks.
- [ ] **Step 4:** Related section:
  - pending: `<StatusMessage size="inline" message="Loading related listings…" />`
  - error: `size="inline" message="Couldn't load related listings"`
  - data with length 0: render nothing
  - otherwise: `<section>` with `<SectionHeader title="More like this" action={{ to: \`/browse?categoryId=${listing.categoryId}\`, label: "See all →" }} />` and the grid
- [ ] **Step 5:** Delete `sellerInitials.ts` and its export from `src/entities/listing/index.ts`. Run `grep -rn sellerInitials src`. Expected: no matches.
- [ ] **Step 6:** Apply the common rule and run the final checks.

### Task 5: Home page and storefront chrome widgets

**Files:**
- Modify:
  - `src/pages/Home.tsx`
  - `src/widgets/trending-strip/ui/TrendingStrip.tsx`
  - `src/widgets/categories-topics-strip/ui/CategoriesTopicsStrip.tsx`
  - `src/widgets/stats-strip/ui/SiteStatisticsStrip.tsx`
  - `src/widgets/footer/ui/SiteFooter.tsx`
  - `src/widgets/header/ui/SiteHeader.tsx`
  - `src/widgets/mobile-nav/ui/MobileNav.tsx`

**Interfaces:**
- Consumes:
  - `useLatestListingsQuery`
  - `useRootCategoriesQuery`
  - `SectionHeader`, `StatusMessage`, `ButtonLink`, `Button`

- [ ] **Step 1:** `TrendingStrip`:
  - Replace the effect with `useLatestListingsQuery(4)`. Keep `// TODO: Get trending listings from the API`.
  - The section is hidden when the data is an empty array.
  - `<SectionHeader title="Trending Now" subtitle="High-demand items, moving fast." action={{ to: "/browse", label: "See all →" }} />`
  - Loading and error use `StatusMessage size="inline"`, with the same copy as today.
- [ ] **Step 2:** `CategoriesTopicsStrip`:
  - `useRootCategoriesQuery()`
  - `SectionHeader title="Browse by Category" action={{ to: "/browse", label: "All →" }}`
  - inline status messages
  - hidden when the data is empty
- [ ] **Step 3:** `Home`:
  - "Start Browsing" → `<ButtonLink to="/browse" size="lg" className="md:px-8 md:py-3.5">`
  - "List an Item" → `<Button variant="outline" size="lg" className="md:px-8 md:py-3.5">`
- [ ] **Step 4:** Apply the common rule to the remaining widgets, then run the final checks.

### Task 6: Browse, filters, sorter, filter panel

**Files:**
- Modify:
  - `src/pages/Browse.tsx`
  - `src/features/listing-filters/ui/CategoryFilter.tsx`, `ConditionFilter.tsx`, `PriceFilter.tsx`, `SearchFilter.tsx`
  - `src/features/listing-sorters/ui/SortDropdownButton.tsx`
  - `src/widgets/filter-panel/ui/FilterPanel.tsx`, `SearchButton.tsx`

**Interfaces:**
- Consumes:
  - `useRootCategoriesQuery`, `useListingsQuery`
  - `isNotFoundError`, `Button`, `Eyebrow`, `StatusMessage`

- [ ] **Step 1:** `Browse` subtitle:
  - while pending: `…`
  - on success: `` `Page ${data.pageIndex} of ${Math.max(data.totalPages, 1)}` ``
  - on error: empty
- [ ] **Step 2:** `Browse` badge and mobile panel:
  - The badge counts `applied.categoryId !== null`, `applied.condition !== null` and `applied.searchText !== null`.
  - The mobile panel button reads `Show results`.
- [ ] **Step 3:** `Browse` states and exports:
  - Remove `export` from `BrowseContent`.
  - Loading, error and empty use `StatusMessage size="block"` (empty: `symbol="∅" message="No listings match your filters"`).
- [ ] **Step 4:** `CategoryFilter`:
  - The roots query becomes `useRootCategoriesQuery()`. Keep the `enabled` behaviour: render roots only when `selectedCategoryId === null`. Fetching while a category is selected is acceptable, since it is cached and shared with the home strip.
  - `loadCategoryLevel` uses `isNotFoundError(error)` instead of `error.message.includes("404")`.
- [ ] **Step 5:** `PriceFilter` inputs:
  - `aria-label="Minimum price"` / `"Maximum price"`
  - `type="number"` is **not** added (keep it unwired and unchanged)
- [ ] **Step 6:** Use `Eyebrow as="h3"` for the filter headings and `Button` (full width) in `SearchButton`. Apply the common rule and run the final checks.

### Task 7: Session and auth UI

**Files:**
- Modify:
  - `src/features/visitor-session/ui/HeaderAccountControls.tsx`
  - `src/pages/Login.tsx`, `Callback.tsx`, `VerifyEmail.tsx`
  - `src/app/layouts/AuthLayout.tsx`, `MainLayout.tsx`
  - `src/widgets/account-gate/ui/AccountGate.tsx`, `EmailVerificationNotice.tsx`

**Interfaces:**
- Consumes: `getInitials`, `Avatar`, `Tabs`, `Button`, `Eyebrow`, `StatusMessage`

- [ ] **Step 1:** `HeaderAccountControls`:
  - Delete `accountInitials` and `IdentityMark`.
  - Use `<Avatar size="xs" src={account.photoUrl} initials={getInitials(account.displayName, account.email)} />`.
- [ ] **Step 2:** `Login`:
  - The sign-in/sign-up tabs become `<Tabs items={…} value={mode} onChange={onModeChange} disabled={!configured || busy} className="mb-8" />`.
  - The continue button becomes `<Button size="lg" className="w-full">`.
  - The underline text buttons stay as they are (not a Button variant).
- [ ] **Step 3:** Apply the common rule and run the final checks.

### Task 8: Mock pages: Profile, Orders, Settings

**Files:**
- Modify: `src/pages/Profile.tsx`, `src/pages/Orders.tsx`, `src/pages/Settings.tsx`

**Interfaces:**
- Consumes:
  - `getInitials`, `Avatar`, `Tabs`, `Button`, `Eyebrow`, `StatusMessage`
  - `ConditionBadge` (Profile's mock items use lowercase `ListingCondition` values or `null`)

- [ ] **Step 1:** `Profile`:
  - Delete `profileInitials`; the header uses `<Avatar size="xl" …initials={getInitials(account?.displayName, account?.email)} />` and review authors use `Avatar size="sm"`.
  - Tabs use `<Tabs>`.
  - Message and Follow use `Button` (outline / primary).
  - The mock listing card keeps its markup but uses `ConditionBadge`. Map the mock conditions `Excellent` / `Good` / `Vintage` → `"used"` and `New` → `"new"`.
- [ ] **Step 2:** `Orders`:
  - `statusStyle` becomes a `Record<OrderStatus, string>` of classes:
    - Processing: `text-accent bg-accent/8`
    - In Transit: `text-info bg-info/8`
    - Delivered: `text-success bg-success/8`
  - The chevron uses `transition-transform` plus `rotate-180` when open.
  - The empty state uses `StatusMessage size="block" symbol="∅"`.
- [ ] **Step 3:** `Settings`:
  - `Field` uses `useId()` with `<label htmlFor={id}>` and `<input id={id}>`.
  - `Toggle` is a `button type="button" role="switch" aria-checked={on} aria-label={label}`:
    - track: `rounded-full`, `bg-primary` when on and `bg-border` when off
    - knob: `rounded-full`, `left-[22px]` when on and `left-0.5` when off
  - The account avatar uses `<Avatar size="lg" initials={getInitials(account?.displayName, account?.email)} />`.
  - "Delete account" uses `Button variant="danger"`.
- [ ] **Step 4:** Apply the common rule and run the final checks.

---

### Task 9: Final verification (`test-runner`)

- [ ] **Step 1:** `npm run validate`. Expected: exits 0.
- [ ] **Step 2:** `npm run test`. Expected: 0 failed.
- [ ] **Step 3:** `npm run build`. Expected: succeeds.
- [ ] **Step 4:** `grep -rn "fontFamily\|borderRadius\|#[0-9a-fA-F]\{6\}" src --include=*.tsx`. Expected: no output.
- [ ] **Step 5:** `grep -rn "<button" src --include=*.tsx -A3 | grep -c "type="` compared with `grep -rc "<button" src --include=*.tsx`. Expected: every button has a `type`. Check any mismatch by hand.
- [ ] **Step 6:** Manual check with `aspire run`:
  - Home
  - Browse (filters, "Page X of Y", mobile panel)
  - a listing detail page
  - `/listings/does-not-exist` (shows "Listing not found")
  - Profile, Orders, Settings, Login
  - Report any visual regression beyond the intentional ones in the spec.
