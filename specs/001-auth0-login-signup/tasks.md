---
description: "Task list for Auth0 login and signup storefront implementation"
---

# Tasks: Auth0 Login and Signup

**Input**: Design documents from `/specs/001-auth0-login-signup/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included. [plan.md](./plan.md) and [research.md](./research.md) require Vitest for pure `src/auth` helpers (return-path sanitization, mode parsing, fully-usable mapping, guest/signed-in chrome predicates). Constitution Quality Standards require focused unit tests for new logic. Hosted-login E2E stays manual via [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Storefront only: `Clients/mc.market.reactwebapp/src/` (`auth/`, `layouts/`, `pages/`, `components/`, `models/`). No new Gateway, Shared, or service projects.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Tooling, local Auth0 env, and tenant URIs so the SPA can talk to the existing tenant

- [X] T001 Add Vitest as a devDependency and an `npm test` script in `Clients/mc.market.reactwebapp/package.json`; enable Vitest in `Clients/mc.market.reactwebapp/vite.config.ts` and include Vitest types in `Clients/mc.market.reactwebapp/tsconfig.app.json` (colocate `*.test.ts` under `src/auth/`)
- [X] T002 [P] Create gitignored `Clients/mc.market.reactwebapp/.env.development` with `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, and `VITE_AUTH0_AUDIENCE` copied from the existing tenant (same values APIs already use; never commit this file)
- [ ] T003 [P] Register Allowed Callback URLs `http://localhost:55577/callback`, Allowed Logout URLs `http://localhost:55577/`, and Allowed Web Origins / CORS `http://localhost:55577` on the existing Auth0 SPA app per `specs/001-auth0-login-signup/contracts/auth0-spa-application.md` (add Aspire/gateway origins if the browser uses those)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Session types, Auth0 provider, sanitizers, and route shells that every story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Add `VisitorStatus`, `AccountView`, `SessionErrorView`, and `VisitorSessionView` in `Clients/mc.market.reactwebapp/src/models/session.ts` matching `specs/001-auth0-login-signup/contracts/session-account.md`
- [X] T005 [P] Implement Auth0 `User` → `AccountView` mapping (missing `sub` → guest + error; missing `email_verified` → treated as verified) in `Clients/mc.market.reactwebapp/src/auth/mapAccount.ts`
- [X] T006 [P] Implement `sanitizeReturnTo` allowlist (`/`, `/browse`, `/listings/{id}`, `/profile`, `/orders`, `/settings`; reject `//`, schemes, `/login`, `/callback`) in `Clients/mc.market.reactwebapp/src/auth/returnTo.ts`
- [X] T007 [P] Implement `parseAuthPageMode` (`sign-in` | `sign-up`; invalid/missing → `sign-in`) in `Clients/mc.market.reactwebapp/src/auth/authPageMode.ts`
- [X] T008 [P] Implement header chrome predicates (guest auth actions, identity control, account nav only when `isFullyUsable`) in `Clients/mc.market.reactwebapp/src/auth/chrome.ts`
- [X] T009 [P] Implement visitor-safe `SessionErrorView` mapping (`missing_config`, Auth0 `error`, `callback_failed`; never include tokens) in `Clients/mc.market.reactwebapp/src/auth/sessionError.ts`
- [X] T010 Update `Clients/mc.market.reactwebapp/src/auth/auth0.ts` so `redirect_uri` is `{origin}/callback`, enable `useRefreshTokens` and `useRefreshTokensFallback`, keep `cacheLocation: "localstorage"`, and export `isAuth0Configured` for missing domain/clientId
- [X] T011 Implement `useVisitorSession` that maps SDK `isLoading` / `isAuthenticated` / `user` / `error` into `VisitorSessionView` in `Clients/mc.market.reactwebapp/src/auth/useVisitorSession.ts`
- [X] T012 Wrap the tree with `Auth0Provider` in `Clients/mc.market.reactwebapp/src/App.tsx` (or `Clients/mc.market.reactwebapp/src/main.tsx`); if `isAuth0Configured` is false, skip the provider so public pages still render
- [X] T013 [P] Create dedicated authentication chrome (MKT. wordmark, Fraunces / Outfit / `#e8820c`; no marketplace nav, search, cart, or placeholder profile) in `Clients/mc.market.reactwebapp/src/layouts/AuthLayout.tsx`
- [X] T014 Add `/login` and `/callback` under `AuthLayout` and a pass-through `AccountGate` around `/profile`, `/orders`, `/settings` in `Clients/mc.market.reactwebapp/src/routes.ts` plus stub `Clients/mc.market.reactwebapp/src/pages/Login.tsx`, `Clients/mc.market.reactwebapp/src/pages/Callback.tsx`, and `Clients/mc.market.reactwebapp/src/auth/AccountGate.tsx` (`AccountGate` currently renders `<Outlet />` only)
- [X] T015 Implement `loginWithRedirect` wrapper (`appState.returnTo` sanitized; `authorizationParams.screen_hint: "signup"` only for sign-up) in `Clients/mc.market.reactwebapp/src/auth/hostedLogin.ts` — do not use `withAuthenticationRequired`

**Checkpoint**: Foundation ready — Auth0 provider mounts, public browse works without config, `/login` and `/callback` resolve on AuthLayout, helpers exist for stories

---

## Phase 3: User Story 1 - Sign in on a dedicated authentication page (Priority: P1) 🎯 MVP

**Goal**: A guest opens `/login`, continues to Auth0 Universal Login (no passwords on MarketCustoms), and returns to the storefront as a signed-in user — or stays on `/login` with a retryable error if hosted login fails

**Independent Test**: Open `/login` as a guest, confirm AuthLayout has no shopping chrome, complete hosted sign-in with a valid verified account, and confirm the storefront treats the visitor as that signed-in user (Home or a safe `returnTo`)

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T016 [P] [US1] Add Vitest cases for allowlist, open-redirect rejects, and `/` fallback in `Clients/mc.market.reactwebapp/src/auth/returnTo.test.ts`
- [X] T017 [P] [US1] Add Vitest cases for `sub`/`name`/`nickname`/`picture` mapping and missing-`sub` guest+error in `Clients/mc.market.reactwebapp/src/auth/mapAccount.test.ts`

### Implementation for User Story 1

- [X] T018 [US1] Implement branded sign-in start (mode default `sign-in`, no password fields, Continue starts hosted login) in `Clients/mc.market.reactwebapp/src/pages/Login.tsx`
- [X] T019 [US1] Implement `/callback` token-exchange page (AuthLayout only; no Home data work) in `Clients/mc.market.reactwebapp/src/pages/Callback.tsx`
- [X] T020 [US1] On Auth0 success, navigate to sanitized `appState.returnTo` (default `/`); on `error` / cancel / network fail, leave the visitor signed out and send them to `/login` with a retryable error in `Clients/mc.market.reactwebapp/src/pages/Callback.tsx` and `Clients/mc.market.reactwebapp/src/auth/hostedLogin.ts`
- [X] T021 [US1] Show visitor-safe retry copy on `/login` for `?error`, `missing_config`, and session errors (no tokens, secrets, or stack traces) in `Clients/mc.market.reactwebapp/src/pages/Login.tsx`
- [X] T022 [US1] Make forgotten-password recovery reachable by sending the visitor to Auth0 hosted login from `Clients/mc.market.reactwebapp/src/pages/Login.tsx` (do not collect a new password on MarketCustoms)
- [X] T023 [US1] Finish AuthLayout distinctness (no cart, search, marketplace nav, or placeholder person) in `Clients/mc.market.reactwebapp/src/layouts/AuthLayout.tsx`

**Checkpoint**: Guest can complete hosted sign-in from `/login` and land signed in; cancel/fail returns to `/login` with retry; public Home still loads if Auth0 env is missing

---

## Phase 4: User Story 2 - Create an account from the same page (Priority: P1)

**Goal**: The same dedicated page supports sign-up mode, starts Auth0 with `screen_hint=signup`, and treats unverified new accounts as signed in for public browse while blocking Profile / Orders / Settings content with verification guidance

**Independent Test**: From `/login?mode=sign-up`, create an account on Auth0; land signed in; if email verification is required, browse Home/Browse/listings but do not see account data on Profile/Orders/Settings — stay signed in, not sent to `/login`

### Tests for User Story 2

- [X] T024 [P] [US2] Add Vitest cases for `mode=sign-in` / `sign-up` / invalid / missing in `Clients/mc.market.reactwebapp/src/auth/authPageMode.test.ts`
- [X] T025 [P] [US2] Add Vitest cases for `email_verified` false → `isFullyUsable: false`, true/absent claim → fully usable in `Clients/mc.market.reactwebapp/src/auth/mapAccount.test.ts`

### Implementation for User Story 2

- [X] T026 [US2] Let the visitor switch sign-in vs sign-up on the same page (URL `?mode=`) before hosted login in `Clients/mc.market.reactwebapp/src/pages/Login.tsx`
- [X] T027 [US2] Call `startHostedLogin("sign-up")` so Auth0 opens New Universal Login signup (`screen_hint`) from `Clients/mc.market.reactwebapp/src/auth/hostedLogin.ts`
- [X] T028 [P] [US2] Add verification-next-steps copy (stay signed in; verify email; public browse still available) in `Clients/mc.market.reactwebapp/src/components/EmailVerificationNotice.tsx`
- [X] T029 [US2] When `status === signed-in` and `!account.isFullyUsable`, keep the account URL and render `EmailVerificationNotice` instead of page data in `Clients/mc.market.reactwebapp/src/auth/AccountGate.tsx` (do not redirect to `/login` for unverified users)
- [X] T030 [US2] Confirm Home, Browse, and listing details in `Clients/mc.market.reactwebapp/src/routes.ts` stay ungated so an unverified signed-in visitor can browse without repeating sign-in

**Checkpoint**: Sign-up from the dedicated page works; duplicate-identifier messaging stays on Auth0 hosted login; unverified users browse publicly and see verification guidance on account URLs

---

## Phase 5: User Story 3 - Reach sign-in from the storefront and protected account areas (Priority: P2)

**Goal**: Guest shopping header shows only Sign in / Sign up; those links open `/login` in the matching mode; guests who hit Profile / Orders / Settings (including by URL) are sent to the dedicated page with `returnTo`; after a fully usable sign-in they return to that page with signed-in chrome

**Independent Test**: Guest header shows Sign in and Sign up only; Sign in → `/login?mode=sign-in`; Sign up → `/login?mode=sign-up` (switchable); open `/profile` while signed out → auth page; after fully usable sign-in, arrive at Profile with signed-in header; Home/Browse/listing never force sign-in

### Tests for User Story 3

- [X] T031 [P] [US3] Add Vitest cases for guest vs signed-in vs not-fully-usable header predicates in `Clients/mc.market.reactwebapp/src/auth/chrome.test.ts`

### Implementation for User Story 3

- [X] T032 [P] [US3] Build header account controls (guest: Sign in / Sign up; signed-in: identity + sign out; account nav only if fully usable; no Unsplash / “Jordan Nakamura”) in `Clients/mc.market.reactwebapp/src/components/HeaderAccountControls.tsx`
- [X] T033 [US3] Replace always-on Profile / Orders / Settings / placeholder avatar in `Clients/mc.market.reactwebapp/src/layouts/MainLayout.tsx` with `HeaderAccountControls` driven by `useVisitorSession` (keep Browse, search, and cart on the shopping layout)
- [X] T034 [US3] For `status === guest` (and after authenticating settles), `Navigate` to `/login?mode=sign-in&returnTo=<current path>` — never `loginWithRedirect` — in `Clients/mc.market.reactwebapp/src/auth/AccountGate.tsx`
- [X] T035 [US3] Wire guest Sign in → `/login?mode=sign-in` and Sign up → `/login?mode=sign-up` (optional `returnTo` only when leaving a protected URL) in `Clients/mc.market.reactwebapp/src/components/HeaderAccountControls.tsx`
- [X] T036 [US3] Pass the captured `returnTo` into hosted login `appState` from `Clients/mc.market.reactwebapp/src/pages/Login.tsx` so a successful fully usable sign-in returns to `/profile`, `/orders`, or `/settings`
- [X] T037 [US3] Show Profile / Orders / Settings in shopping chrome only when `account.isFullyUsable` in `Clients/mc.market.reactwebapp/src/components/HeaderAccountControls.tsx` and `Clients/mc.market.reactwebapp/src/layouts/MainLayout.tsx`
- [X] T038 [US3] Verify `/`, `/browse`, and `/listings/:listingId` in `Clients/mc.market.reactwebapp/src/routes.ts` remain usable without authentication (no `AccountGate` on public routes)

**Checkpoint**: Guest entry points and URL protection work; signed-in header appears after a fully usable session; public browse is never forced through `/login`

---

## Phase 6: User Story 4 - Stay signed in and sign out (Priority: P2)

**Goal**: Session survives refresh via localStorage + refresh tokens; signed-in users can sign out to Home as a guest; opening `/login` while already signed in sends them into the storefront

**Independent Test**: Sign in, refresh, still signed in; sign out, land on a public page with guest header; signed-in visit to `/login` does not ask for credentials again

### Implementation for User Story 4

- [X] T039 [US4] Call Auth0 `logout({ logoutParams: { returnTo: origin + "/" } })` from the shopping header in `Clients/mc.market.reactwebapp/src/components/HeaderAccountControls.tsx` (reuse `logoutReturnTo` from `Clients/mc.market.reactwebapp/src/auth/auth0.ts`)
- [X] T040 [US4] After logout, visitor is a guest on Home (or another public page) with Sign in / Sign up restored — confirm chrome in `Clients/mc.market.reactwebapp/src/layouts/MainLayout.tsx`
- [X] T041 [US4] Redirect signed-in visitors who open `/login` to Home or a safe public `returnTo` (never re-prompt hosted login) in `Clients/mc.market.reactwebapp/src/pages/Login.tsx`
- [X] T042 [US4] When `displayName` and `photoUrl` are both null, render a neutral signed-in control (email local-part initials or generic mark) — never a hardcoded fake person — in `Clients/mc.market.reactwebapp/src/components/HeaderAccountControls.tsx`

**Checkpoint**: Refresh keeps the session; sign-out restores guest chrome on a public page; `/login` is only for guests

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality bar, security hygiene, and hosted-login validation across stories

- [X] T043 [P] Audit `Clients/mc.market.reactwebapp/src/layouts/MainLayout.tsx` and account pages so no leftover Unsplash avatar or “Jordan Nakamura” / `@j.nakamura` placeholder identity remains
- [X] T044 Confirm tokens, client secrets, and connection strings are never rendered or `console.log`’d in `Clients/mc.market.reactwebapp/src/auth/` and `Clients/mc.market.reactwebapp/src/pages/Login.tsx` / `Callback.tsx`
- [X] T045 Run `npm run lint`, `npm run build`, and `npm test` in `Clients/mc.market.reactwebapp` and fix all failures/warnings on this feature’s scope
- [ ] T046 Walk `specs/001-auth0-login-signup/quickstart.md` scenarios 1–8 against the existing Auth0 tenant (dedicated layout, header modes, sign-in, sign-up + verification, protected URLs, persistence/sign-out, cancel/misconfig, guest browse)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Sequential in priority order is the default: US1 → US2 → US3 → US4 (shared files: `Login.tsx`, `AccountGate.tsx`, `MainLayout.tsx`, `HeaderAccountControls.tsx`)
  - US1 is independently demoable as MVP once Phase 2 is done
- **Polish (Phase 7)**: Depends on the user stories you are delivering

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — no other story required
- **User Story 2 (P1)**: After Foundational; shares `/login` with US1 (implement after US1 if a single developer). Independently testable as “sign-up + verification gate”
- **User Story 3 (P2)**: After Foundational; needs US1 hosted login to complete the return-to-protected-page path. Spec: entry points and protection depend on sign-in/sign-up working
- **User Story 4 (P2)**: After Foundational; needs a working signed-in session (US1). Refresh-token config is already in T010

### Within Each User Story

- Tests (where listed) MUST be written and FAIL before implementation
- Helpers/models (Phase 2) before pages
- Guest gate (US3) must not call `loginWithRedirect`
- Unverified gate (US2) must not treat the visitor as signed out
- Story complete before moving to the next priority when staffing is one person

### Parallel Opportunities

- T002 and T003 can run in parallel with T001
- T004–T009 and T013 can run in parallel once Setup is done
- T016 and T017 can run in parallel; T024 and T025 can run in parallel; T028 and T032 can run in parallel with other stories’ files
- After Foundational, US2 verification UI (`EmailVerificationNotice.tsx`) can proceed in parallel with US1 Login/Callback if `AccountGate` is not being edited at the same time
- Hosted-login dashboard work (T003) can proceed in parallel with all code tasks

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests together:
Task: "Add Vitest cases for allowlist, open-redirect rejects, and / fallback in Clients/mc.market.reactwebapp/src/auth/returnTo.test.ts"
Task: "Add Vitest cases for sub/name/nickname/picture mapping and missing-sub guest+error in Clients/mc.market.reactwebapp/src/auth/mapAccount.test.ts"

# After tests fail, Login and Callback can be split if AuthLayout already exists:
Task: "Implement branded sign-in start in Clients/mc.market.reactwebapp/src/pages/Login.tsx"
Task: "Implement /callback token-exchange page in Clients/mc.market.reactwebapp/src/pages/Callback.tsx"
```

## Parallel Example: User Story 2

```bash
Task: "Add Vitest cases for mode=sign-in / sign-up / invalid / missing in Clients/mc.market.reactwebapp/src/auth/authPageMode.test.ts"
Task: "Add Vitest cases for email_verified / isFullyUsable in Clients/mc.market.reactwebapp/src/auth/mapAccount.test.ts"
Task: "Add verification-next-steps copy in Clients/mc.market.reactwebapp/src/components/EmailVerificationNotice.tsx"
```

## Parallel Example: User Story 3

```bash
Task: "Add Vitest cases for header predicates in Clients/mc.market.reactwebapp/src/auth/chrome.test.ts"
Task: "Build header account controls in Clients/mc.market.reactwebapp/src/components/HeaderAccountControls.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Vitest, `.env.development`, Auth0 callback URLs)
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Guest → `/login` → Auth0 hosted login → signed-in storefront; cancel → retry on `/login`
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → provider, sanitizers, AuthLayout routes
2. US1 → dedicated sign-in → Demo (MVP)
3. US2 → sign-up mode + email-verification gate → Demo
4. US3 → guest header + protected-URL redirect + returnTo → Demo
5. US4 → persist + sign-out + skip `/login` when already signed in → Demo
6. Polish → lint/build/test + quickstart.md

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (`Login.tsx`, `Callback.tsx`)
   - Developer B: User Story 2 (`EmailVerificationNotice.tsx`, `mapAccount` verification tests) — coordinate on `Login.tsx` / `AccountGate.tsx`
   - Developer C: User Story 3 (`HeaderAccountControls.tsx`, `chrome.test.ts`) — coordinate on `MainLayout.tsx` / `AccountGate.tsx`
3. User Story 4 follows US1 + US3 header controls

---

## Notes

- [P] tasks = different files, no dependencies on incomplete work
- [Story] label maps task to spec.md user stories (US1–US4)
- Do not collect passwords on MarketCustoms; do not use `withAuthenticationRequired`
- Do not add .NET tests, new microservices, or YARP routes
- SPA is not an authority for roles, prices, or API authorization
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- Avoid: vague tasks, simultaneous edits to the same file, treating unverified users as signed out
