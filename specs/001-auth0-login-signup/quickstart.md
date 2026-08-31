# Quickstart: Auth0 Login and Signup

Validate the storefront identity flow against [spec.md](./spec.md). Design details live in [research.md](./research.md), [data-model.md](./data-model.md), and [contracts/](./contracts/).

## Prerequisites

- Auth0 SPA application configured per [contracts/auth0-spa-application.md](./contracts/auth0-spa-application.md) (callback `/callback`, logout `/`, web origin = Vite origin).
- `Clients/mc.market.reactwebapp/.env.development` with `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE` (gitignored). Reuse the existing tenant values used by APIs.
- Node.js sufficient to run the Vite app (`npm` in `Clients/mc.market.reactwebapp`).
- Two Auth0 users: one with verified email, one new signup that still needs verification (or a user with `email_verified=false`).

Gateway/Aspire is not required for these scenarios; listing data is still local to the client.

## Setup

```powershell
cd Clients/mc.market.reactwebapp
npm install
npm run dev
```

Open the printed origin (expected `http://localhost:55577`).

Optional quality checks after implementation:

```powershell
npm run lint
npm run build
npm test
```

(`npm test` is the Vitest suite for `src/auth` helpers.)

## Scenarios

### 1. Dedicated authentication layout (SC-008, FR-001, FR-002)

1. As a guest, open `/login`.
2. Confirm no marketplace nav, search, cart, or placeholder profile.
3. Confirm MKT. branding and Sign in / Sign up as modes of the same page.

**Expected**: Authentication layout is visually distinct from shopping pages.

### 2. Header entry points (FR-006, FR-007)

1. On Home as a guest, confirm header shows **Sign in** and **Sign up** only.
2. Sign in → `/login?mode=sign-in`. Sign up → `/login?mode=sign-up`.
3. Switch mode on the page, then continue to Auth0.

**Expected**: Mode is preset from the header and can change before hosted login.

### 3. Sign in (SC-002, FR-004, FR-010)

1. From `/login` in sign-in mode, continue to Auth0 Universal Login.
2. Enter credentials on Auth0 (not on MarketCustoms).
3. Complete login with a verified account.

**Expected**: Return to Home (or the page you started from if it was a safe in-app path) in under 1 minute, signed in, with real display attributes (or a neutral control).

### 4. Sign up and email verification (SC-001, SC-009, FR-021)

1. From `/login?mode=sign-up`, create an account on Auth0.
2. If verification is required, land signed in for public browse.
3. Open `/profile` (or Orders / Settings).

**Expected**: Account created and storefront session established in under 2 minutes. Unverified users browse Home/Browse/listings, do not see account data, see what to do next, and are not sent to `/login` solely because verification is pending.

### 5. Protect account URLs (SC-003, FR-008)

1. While signed out, open `/profile`, `/orders`, and `/settings` (including by URL).
2. Complete sign-in with a fully usable account from one of those redirects.

**Expected**: Each guest attempt shows the dedicated auth page, not account content. After success, 100% return to that page with signed-in header controls.

### 6. Persistence and sign-out (SC-005, FR-011, FR-012)

1. Sign in, refresh, confirm still signed in.
2. Sign out from the shopping header.

**Expected**: Refresh does not prompt for credentials. After sign-out, Home (or another public page) shows guest header (Sign in / Sign up).

### 7. Failure and misconfiguration (FR-014)

1. Start hosted login and cancel or close Auth0; or complete an invalid login.
2. Temporarily rename env vars and reload, then visit Home and `/login`.

**Expected**: Visitor remains signed out with retry on `/login`. Public storefront is not blank when Auth0 is missing; `/login` shows a recoverable error.

### 8. Guest browse (SC-006)

1. Without signing in, complete Home → Browse → a listing.

**Expected**: No forced authentication.
