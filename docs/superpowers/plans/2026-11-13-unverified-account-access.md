# Unverified Account Access Implementation Plan

> **For agentic workers:** Execute per the task-storm pipeline: one `react-coder` per task, then `react-reviewer` against the working-tree `git diff`. **No commits.** Steps use checkbox (`- [ ]`) syntax.

**Goal:** Let signed-in users with an unverified email open Profile and Settings and see disabled "Resend verification email" / "Delete account" actions, while Orders stays gated.

**Architecture:** Split the current `AccountGate` into a sign-in gate (`AccountGate`) and a verification gate (`VerifiedGate`) that wraps only `orders` and `verify-email`. Relax `showAccountNav` to any signed-in account and add `showOrdersNav` for verified accounts. Page-local UI changes in Settings, Profile and VerifyEmail.

**Tech Stack:** React 19, React Router, TypeScript, Tailwind, Vitest. FSD layering (`app → pages → widgets → features → entities → shared`).

**Spec:** `docs/superpowers/specs/2026-11-13-unverified-account-access-design.md`

All paths below are relative to `Clients/mc.market.reactwebapp/`.

## Global Constraints

- Frontend only; no backend or API client changes.
- Resend and Delete buttons are rendered `disabled` with the hint text exactly `Coming soon`.
- Delete account is disabled for **all** users.
- FSD rules from `README.md`: import slice roots (`@/entities/session`), relative imports inside a slice, page-local UI stays in the page.
- Match existing Tailwind class conventions (e.g. `text-muted-foreground font-mono text-xs` for hints).
- No new dependencies.

## Review Focus

1. Unverified user opening `/orders` directly → sees `VerifyEmailPage`, not Orders (Task 2, manual check).
2. Verified user opening `/verify-email` → redirected to `/` (Task 2, manual check).
3. Guest opening `/profile` or `/settings` → redirected to `/login?mode=sign-in&returnTo=...` (Task 2, manual check).
4. Unverified account with `email: null` → Settings notice reads "Your email isn't verified yet." with no blank gap (Task 3).
5. Signed-in session with `account: null` → `showAccountNav` and `showOrdersNav` both false (Task 1 test).

---

### Task 1: Session selectors and header nav — **TDD**

**Files:**
- Modify: `src/entities/session/model/selectors.ts`
- Modify: `src/entities/session/index.ts` (export `showOrdersNav`)
- Modify: `src/widgets/site-header/model/navLinks.ts`
- Test: `src/entities/session/model/__tests__/selectors.test.ts`
- Test: `src/widgets/site-header/model/__tests__/navLinks.test.ts`

**Interfaces:**
- Produces: `showAccountNav(session: VisitorSessionView): boolean` — `status === "signed-in" && account != null`.
- Produces: `showOrdersNav(session: VisitorSessionView): boolean` — `status === "signed-in" && account?.isFullyUsable === true`.
- `features/auth/ui/AccountControls.tsx` keeps calling `showAccountNav`; no change there.

- [ ] **Step 1: Update tests**
  - `selectors.test.ts`: in the unverified case assert `showAccountNav(unverified) === true` and `showOrdersNav(unverified) === false`; add a fully usable case asserting both `true`; guest and authenticating assert `showOrdersNav === false`; add a case `{ status: "signed-in", account: null }` asserting both `false`.
  - `navLinks.test.ts`: rename "shows only Browse while the account is not fully usable" to "shows Browse, Profile and Settings while the account is not fully usable", expecting `[routes.browse, routes.profile, routes.settings]`. The verified case stays `[browse, orders, profile, settings]`.
- [ ] **Step 2: Run** `npx vitest run src/entities/session src/widgets/site-header` — expect FAIL (`showOrdersNav` not exported / wrong nav list).
- [ ] **Step 3: Implement** the two selectors in `selectors.ts`, export `showOrdersNav` from `src/entities/session/index.ts`, and change `getNavLinks` to: `[browse]` when `!showAccountNav`; otherwise `[browse, ...(showOrdersNav ? [orders] : []), profile, settings]`.
- [ ] **Step 4: Run** the same command — expect PASS.
- [ ] **Step 5:** Report changed files (no commit).

### Task 2: Route gates — no TDD (routing glue)

**Files:**
- Modify: `src/app/routing/AccountGate.tsx`
- Create: `src/app/routing/VerifiedGate.tsx`
- Modify: `src/app/routing/router.tsx`

**Interfaces:**
- Produces: `export function VerifiedGate(): JSX.Element` — returns `<VerifyEmailPage />` when `session.account && !session.account.isFullyUsable`, else `<Outlet />`.

- [ ] **Step 1:** In `AccountGate`, delete the `isFullyUsable` branch and the `VerifyEmailPage` import; keep the authenticating and guest branches unchanged.
- [ ] **Step 2:** Create `VerifiedGate.tsx` per the interface above, using `useVisitorSession` from `@/entities/session` and `VerifyEmailPage` from `@/pages/verify-email`.
- [ ] **Step 3:** In `router.tsx`, nest a `{ Component: VerifiedGate, children: [orders, verify-email] }` route inside the `AccountGate` children; `profile` and `settings` stay direct children of `AccountGate`.
- [ ] **Step 4: Verify** `npm run lint` and `npm run build` pass; walk through Review Focus items 1–3 manually against the route tree.
- [ ] **Step 5:** Report changed files.

### Task 3: Settings page actions — no TDD (page UI)

**Files:**
- Modify: `src/pages/settings/ui/SettingsPage.tsx`

**Interfaces:**
- Consumes: `account.emailVerified`, `account.email` from `useVisitorSession()`.

- [ ] **Step 1:** In the Account section, above the avatar row, render an email verification notice only when `account?.emailVerified === false`. Use a bordered card (`border-border bg-card rounded-xs border p-4/p-5`) with these elements:
  - Heading: `Your email {email} isn't verified yet.`, or `Your email isn't verified yet.` when there's no email. Show the email in `text-foreground`.
  - Line: `Verify your email to unlock orders.`
  - `<Button variant="outline" size="sm" disabled>Resend verification email</Button>`
  - Hint: `Coming soon`
- [ ] **Step 2:** In Security › Danger zone, set `disabled` on `<Button variant="danger">Delete account</Button>` and add a `Coming soon` hint below it. Check that `Button` (`src/shared/ui/Button.tsx`) forwards `disabled` and has disabled styling; if it has none, add `disabled:cursor-not-allowed disabled:opacity-40` to `buttonClasses.ts` (this matches the `AccountControls` convention).
- [ ] **Step 3: Verify** `npm run lint` and `npm run build` pass.
- [ ] **Step 4:** Report changed files.

### Task 4: Profile badge and Verify-email page copy — no TDD (page UI)

**Files:**
- Modify: `src/pages/profile/ui/ProfilePage.tsx`
- Modify: `src/pages/verify-email/ui/VerifyEmailPage.tsx`

**Interfaces:**
- Consumes: `account.emailVerified`, `routes.settings` from `@/shared/config`, `ButtonLink` from `@/shared/ui`.

- [ ] **Step 1:** `ProfilePage`: render the existing `VERIFIED` badge only when `account?.emailVerified` is true. Otherwise render:
  - A muted `UNVERIFIED` badge, in the same shape with `border-border text-muted-foreground border`.
  - A React Router `Link` to `routes.settings` with the text `Verify email` (`text-primary font-mono text-xs`).
- [ ] **Step 2:** `VerifyEmailPage`:
  - Replace the paragraph with: `You're signed in, but orders stay closed until you verify your email. You can still open your profile and settings, and keep browsing the market.`
  - Buttons, in order:
    - `Continue browsing` (primary, `routes.home`)
    - `Open settings` (outline, `routes.settings`)
    - `Browse listings` (outline, `routes.browse`)
- [ ] **Step 3: Verify** `npm run lint` and `npm run build` pass.
- [ ] **Step 4:** Report changed files.

---

## Execution

Tasks 1–4 touch disjoint files and don't depend on each other's interfaces at build time: `AccountControls` already uses `showAccountNav`, and Task 2 doesn't use the new selector. Run them as four parallel `react-coder` dispatches, then run a `react-reviewer` per task.

## Final verification

From `Clients/mc.market.reactwebapp`: `npm run lint`, `npm run test`, `npm run build` — all green (via `test-runner`).
