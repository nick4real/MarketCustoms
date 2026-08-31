# Research: Auth0 Login and Signup

## 1. Identity flow: branded start, then Auth0 Universal Login

**Decision**: Keep credentials on Auth0 New Universal Login. The storefront dedicated page (`/login`) only chooses sign-in vs sign-up and starts `loginWithRedirect`. Do not collect passwords or build a custom hosted-login replacement (no ACUL).

**Rationale**: Spec FR-003 / FR-020 and the 2026-08-31 clarification require a MarketCustoms branded start with credentials entered on Auth0. `@auth0/auth0-react` is already in `Clients/mc.market.reactwebapp` and is the correct SDK for a Vite React SPA.

**Alternatives considered**:
- Embedded login / Resource Owner Password: rejected (passwords on MarketCustoms, weaker security, conflicts with FR-003).
- Advanced Customization for Universal Login (ACUL): rejected (out of spec; credentials would still be a custom Auth0 UI, extra tenant surface).
- Redirecting header actions straight to Auth0: rejected (spec requires the dedicated page as the start, with mode switching before Auth0).

## 2. Sign-in vs sign-up mode

**Decision**: Store mode in the storefront URL as `/login?mode=sign-in` or `/login?mode=sign-up`. Header Sign in / Sign up set that query. The page can switch mode without leaving. Starting Auth0 uses `loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })` only for sign-up; sign-in omits `screen_hint` (or uses `login`).

**Rationale**: Auth0 React SDK v2 requires `screen_hint` inside `authorizationParams`. New Universal Login honors `screen_hint=signup`. Mode in the storefront URL satisfies FR-006 without inventing client-only state that is lost on refresh.

**Alternatives considered**:
- Path split (`/login` vs `/signup`): two URLs for one layout; spec says one page with modes.
- `prompt: "login"` always: forces re-auth but does not open the signup widget.

## 3. Callback, errors, and return destination

**Decision**:
- Auth0 `redirect_uri` is `{origin}/callback` (a minimal route on the authentication layout).
- Persist intended destination in `appState.returnTo` when calling `loginWithRedirect`.
- `onRedirectCallback` (or a callback page after SDK handling) navigates to a **sanitized** in-app path, or Home if missing/unsafe.
- Auth0 `error` / `error_description` (cancel, deny, misconfig) leave the visitor signed out and send them to `/login` with a retry message.
- Do **not** use `withAuthenticationRequired` as the guest gate: that helper calls `loginWithRedirect` immediately and skips the dedicated page.

**Rationale**: Auth0’s React guide recommends a dedicated `/callback` so Home logic does not flash during token exchange. Spec FR-010 / FR-014 require safe return paths and a retryable auth page after failure. Open-redirect protection is mandatory (constitution Security).

**Alternatives considered**:
- `redirect_uri = origin` (`/`): simpler, but Home chrome flashes and Home data work runs during callback.
- `redirect_uri = /login`: works for errors but success still has to leave `/login` immediately (FR-013); a dedicated callback is clearer.

**Return-path rules** (implemented as a pure helper):
- Accept only same-origin relative paths starting with `/`.
- Allow: `/`, `/browse`, `/listings/{id}`, `/profile`, `/orders`, `/settings` (and query strings on those paths).
- Reject: `//`, `\\`, `http:`, `https:`, `javascript:`, `/login`, `/callback`, encoded bypasses, off-site URLs.
- Fallback: `/`.

## 4. Session persistence and sign-out

**Decision**: Keep `cacheLocation: "localstorage"` and enable `useRefreshTokens: true` with `useRefreshTokensFallback: true`. Logout uses `logout({ logoutParams: { returnTo: origin + "/" } })` so Auth0 clears its session and the storefront lands on Home as a guest.

**Rationale**: FR-011 requires persistence across refresh and later visits. Iframe silent auth is unreliable in browsers that block third-party cookies; refresh-token rotation is Auth0’s SPA recommendation. Existing `src/auth/auth0.ts` already chooses localStorage but does not enable refresh tokens.

**Alternatives considered**:
- Memory cache only: fails FR-011 on refresh.
- localStorage without refresh tokens: refresh often fails in Safari; session looks randomly expired.

## 5. Email verification gate (fully usable account)

**Decision**: Treat `user.email_verified === false` as “signed in, not fully usable.” Guests hitting Profile / Orders / Settings are redirected to `/login`. Authenticated but unverified users stay on that account URL and see verification guidance instead of account data; they are not signed out and not sent to `/login`. If the claim is `true` or absent (tenant does not require verification), treat as fully usable.

**Rationale**: Matches FR-008 / FR-021 and Auth0 ID-token `email` + `email_verified` (already requested in `auth0.ts` scopes). Auth0 React v2 removed `claimCheck` on `withAuthenticationRequired`, so a custom storefront gate is required anyway.

**Alternatives considered**:
- Auth0 Action that blocks login until verified: would sign them out of the storefront and violate FR-021.
- Profiles-service `emailAttestedByIdentity`: that is marketplace profile onboarding, out of scope (spec assumption).

## 6. Guest vs signed-in chrome

**Decision**: `MainLayout` reads a mapped session (not raw Auth0 `User`) and:
- **Guest**: Sign in, Sign up only. Hide Profile, Orders, Settings, and any placeholder person (remove the current Unsplash / “Jordan Nakamura” chrome).
- **Signed in (including unverified)**: show a real display name or a neutral control (initials / generic mark), plus sign out. Show Profile / Orders / Settings nav only when the account is fully usable; unverified users who open those URLs get guidance, not data.
- Cart and search stay on the shopping layout; they are absent from `AuthLayout`.

**Rationale**: FR-007, FR-015, FR-016. Constitution UX consistency: reuse MKT. wordmark, Fraunces / Outfit / DM Mono, and existing orange `#e8820c` tokens. Do not introduce a second visual language.

**Alternatives considered**: Keep dummy avatar until Profiles API exists — rejected by FR-015 (no hardcoded fake person).

## 7. Missing or unreachable Auth0

**Decision**: Validate `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` before mounting `Auth0Provider`. If missing, public storefront still renders; `/login` shows a recoverable configuration error. If the SDK reports an error after a hosted-login attempt, show it on `/login` with retry. Do not dump tokens, client secrets, or connection strings into the UI.

**Rationale**: Spec edge case “Auth0 is unreachable or not configured” and FR-017. Empty domain on `Auth0Provider` can crash the tree and take down browsing (violates SC-006).

## 8. Testing approach

**Decision**: Add Vitest (Vite-native) only for pure `src/auth` helpers: return-path sanitization, mode parsing, “fully usable” mapping, and guest/signed-in chrome predicates. Frontend still must pass `npm run lint` and `npm run build`. End-to-end Auth0 hosted login is validated manually via `quickstart.md` against the existing tenant (not a new Auth0 app unless the current SPA app is missing callback URLs).

**Rationale**: Constitution requires tests for new logic; the web app has no test runner today. Full Auth0 redirect E2E in CI needs secrets and a tenant; out of scope for this feature’s automated suite.

**Alternatives considered**: Playwright against Universal Login in CI — high cost, brittle, not required by current frontend quality bar. xUnit in a .NET project — wrong layer for SPA helpers.

## 9. Tenant and environment

**Decision**: Reuse the existing Auth0 tenant and SPA application already referenced by gitignored `Clients/mc.market.reactwebapp/.env.development` (`VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`). Register callback, logout, and web-origin URLs for the Vite origin (default `http://localhost:55577` and the Aspire-proxied gateway origin if that is how the browser is reached).

**Rationale**: Backend APIs already expect this audience. Spec says this feature does not redefine API authorization contracts. SPA client id and domain are public; do not commit `.env.development` (already gitignored).

**Alternatives considered**: Create a new Auth0 application — unnecessary split from APIs and the existing SPA client.

## 10. Token use on this feature

**Decision**: Request `audience` and scopes `openid profile email phone` so the session can later call the gateway with `getAccessTokenSilently`. This feature does **not** add new API calls or attach tokens to listing browse. Profile / Orders / Settings remain presentational placeholders behind the gate.

**Rationale**: FR-019: the SPA is not the authority for roles, prices, or privileged actions. Wiring the provider with the existing audience avoids a second auth config later without expanding scope.

---

All Technical Context unknowns are resolved. No remaining NEEDS CLARIFICATION.
