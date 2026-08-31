# Contract: Auth0 SPA application

The storefront is an Auth0 **Single Page Application** using Authorization Code Flow with PKCE via `@auth0/auth0-react`. This contract is tenant configuration plus the env surface the Vite app reads. It does not change API resource-server validation.

## Environment (Vite)

Provided at runtime via gitignored `.env.development` (and production equivalents). Names already documented in `Clients/mc.market.reactwebapp/vite.config.ts` and `src/auth/auth0.ts`:

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_AUTH0_DOMAIN` | yes | Tenant domain, e.g. `example.eu.auth0.com` |
| `VITE_AUTH0_CLIENT_ID` | yes | SPA application client id (public) |
| `VITE_AUTH0_AUDIENCE` | yes | Existing API identifier; same audience APIs already validate |

Do not add Management API client secrets to the SPA.

## Application settings (Auth0 dashboard)

Application type: **Single Page Application**.

Grant types: Authorization Code, Refresh Token.

Refresh token rotation: **enabled** (SPA default). Absolute and idle lifetimes stay at tenant defaults unless the operator already changed them.

### Application URIs

Register every origin the browser actually uses (Vite dev port and, if shoppers hit the app through the gateway, that origin too).

| Setting | Values (local) |
| --- | --- |
| Allowed Callback URLs | `http://localhost:55577/callback` |
| Allowed Logout URLs | `http://localhost:55577/` |
| Allowed Web Origins | `http://localhost:55577` |
| Allowed Origins (CORS) | `http://localhost:55577` |

If Aspire or the gateway serves the SPA on another host/port, add those URLs the same way. Do not use wildcards.

### Universal Login

- **New** Universal Login (required for `screen_hint=signup`).
- Database connection with email + password (existing tenant methods are enough).
- Forgot password stays on hosted login (FR-018).
- Duplicate identifier messaging stays on hosted login.

### Scopes requested by the SPA

`openid profile email phone`

`email` is required so the ID token can include `email_verified`.

## Redirect contract (runtime)

| Direction | Behavior |
| --- | --- |
| Storefront → Auth0 | `GET https://{domain}/authorize` with PKCE, `redirect_uri={origin}/callback`, optional `screen_hint=signup`, `audience`, `scope` |
| Auth0 → storefront (success) | `{origin}/callback?code=...&state=...` then client navigates to safe `returnTo` |
| Auth0 → storefront (failure) | `{origin}/callback?error=...&error_description=...` then client navigates to `/login` signed out |
| Storefront → Auth0 (logout) | Auth0 logout endpoint with `returnTo={origin}/` |

`appState.returnTo` is signed in `state` by the SDK; the storefront still re-validates the path after callback (see `storefront-auth-routes.md`).
