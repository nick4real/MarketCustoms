# Implementation Plan: Auth0 Login and Signup

**Branch**: `001-auth0-login-signup` | **Date**: 2026-08-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-auth0-login-signup/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add storefront sign-in and sign-up using the existing Auth0 tenant and `@auth0/auth0-react`. Visitors start on a dedicated MarketCustoms page (`/login`) with its own layout (no shopping chrome), then enter credentials on Auth0 Universal Login. After callback they return to a sanitized in-app path. The shopping header shows Sign in / Sign up for guests; Profile, Orders, and Settings stay hidden until a fully usable (email-verified) session exists. Public Home, Browse, and listings remain usable without signing in.

## Technical Context

**Language/Version**: TypeScript ~5.9 / React 19 / Vite 8 (`net10.0` backend unchanged)

**Primary Dependencies**: `@auth0/auth0-react` ^2.24 (already installed), `react-router` 8, Tailwind 4

**Storage**: Auth0 SPA session cache in `localStorage` plus refresh tokens. No new SQL/Mongo collections.

**Testing**: `npm run lint`, `npm run build` in `Clients/mc.market.reactwebapp`; Vitest for pure `src/auth` helpers; manual Auth0 hosted-login scenarios in [quickstart.md](./quickstart.md)

**Target Platform**: Browser SPA (Chrome/Edge/Safari/Firefox current). Local origin `http://localhost:55577` (Vite) and any Aspire/gateway origin registered on the Auth0 app.

**Project Type**: Web application (React storefront). Backend Auth0 resource-server contracts are out of scope.

**Performance Goals**: Auth callback and return navigation feel immediate (no Home flash). Public browse must not wait on a failed Auth0 config. SC-001/SC-002 timeboxes (2 min signup, 1 min sign-in) include hosted login, not SPA render budget.

**Constraints**: No passwords on MarketCustoms; no tokens in UI/logs; no open redirects; guests never see account data; unverified users are not treated as signed out; constitution deny-by-default on account routes; reuse existing visual language.

**Scale/Scope**: One SPA. New: `AuthLayout`, `/login`, `/callback`, session mapping, route gates, header states. Touches `MainLayout`, `routes.ts`, `main.tsx`/`App.tsx`, `src/auth/auth0.ts`. No new microservices.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | How this plan complies |
| --- | --- | --- |
| I. Code Quality | Pass | Narrow to storefront auth/layout/header/routes. Reuse MKT. tokens and existing pages behind gates. No drive-by Profile/Orders redesign. |
| II. Clean Architecture | Pass | Auth0 SDK stays in `src/auth`. UI consumes `VisitorSessionView` / `AccountView`. No Auth0 types in Domain/backend. No new Shared business rules. |
| III. Security | Pass | Auth0 PKCE; default deny on Profile/Orders/Settings; returnTo allowlist; secrets not committed; SPA not used as role/price authority. |
| IV. User Experience Consistency | Pass | Guest vs signed-in header follows spec; auth layout reuses brand type and color; error/empty/loading copy stays concise product tone. |
| V. Performance Requirements | Pass | Dedicated `/callback` avoids Home work during token exchange; no new list endpoints; public routes stay reachable if Auth0 is misconfigured. |
| Quality Standards | Pass | Zero lint/type failures on the web app; Vitest for sanitizer/gate helpers; quickstart covers hosted login. |

No unjustified violations. Complexity Tracking remains empty.

### Post-design re-check

Gates still pass. Contracts are SPA routes + Auth0 application URIs + a client view model, not a new public HTTP API. Email-verification UX is a storefront gate on existing pages, not a Profiles-service change (onboarding remains a later feature). `withAuthenticationRequired` is explicitly rejected because it would skip the dedicated page.

## Project Structure

### Documentation (this feature)

```text
specs/001-auth0-login-signup/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth0-spa-application.md
│   ├── storefront-auth-routes.md
│   └── session-account.md
└── spec.md
```

### Source Code (repository root)

```text
Clients/mc.market.reactwebapp/
├── src/
│   ├── auth/                 # Auth0Provider, config, session mapping, returnTo, gates
│   ├── layouts/
│   │   ├── MainLayout.tsx    # guest vs signed-in chrome
│   │   └── AuthLayout.tsx    # dedicated auth chrome (new)
│   ├── pages/
│   │   ├── Login.tsx         # /login modes (new)
│   │   ├── Callback.tsx      # /callback (new)
│   │   ├── Profile.tsx       # gated; verification empty state
│   │   ├── Orders.tsx
│   │   └── Settings.tsx
│   ├── components/           # header account controls, verification notice
│   ├── models/               # AccountView / session types if not colocated in auth
│   ├── routes.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.development          # gitignored Vite Auth0 vars
└── package.json              # add vitest test script

# Unchanged for this feature
Gateway/MC.Gateway/
Services/*/
Shared/
Aspire/
Tests/                        # no new .NET tests; APIs already Auth0-protected
```

**Structure Decision**: Implement only in `Clients/mc.market.reactwebapp`, following AGENTS.md (`pages/`, `layouts/`, `auth/`, `components/`, `models/`). Tenant URI updates are dashboard configuration, not repository code.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations.
