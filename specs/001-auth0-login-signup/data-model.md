# Data Model: Auth0 Login and Signup

Client-side session model only. Auth0 remains the identity store. No new marketplace database tables. Map Auth0 SDK `user` into storefront types in `src/auth` / `src/models`; presentational components consume those types, not Auth0 SDK objects.

## Entities

### VisitorSession

Represents the current browser visit.

| Field | Type | Rules |
| --- | --- | --- |
| `status` | `guest` \| `authenticating` \| `signed-in` | `authenticating` is SDK `isLoading` or callback in progress. Public pages may render while `authenticating`; account pages must not show account data. |
| `account` | `Account \| null` | Non-null only when `status === signed-in`. |
| `error` | `SessionError \| null` | Recoverable Auth0 or config failure. Never includes tokens. |

**Invariants**:
- Signed-out after failed, cancelled, or interrupted hosted login (`account` is null).
- Session persists across refresh until logout or Auth0 expiry (SDK cache + refresh tokens).
- Multi-tab: a refresh reads the current cache; another tab is not an authoritative second identity.

**State transitions**:

```text
guest
  -- open /login, choose mode --> guest (mode selected)
  -- continue to Auth0 --> authenticating (browser left storefront)
  -- Auth0 success --> signed-in (verified or unverified)
  -- Auth0 cancel / error / network fail --> guest + error on /login
  -- Auth0 not configured --> guest + error on /login only

signed-in (emailVerified = false)
  -- browse Home / Browse / listing --> signed-in (unchanged)
  -- open Profile / Orders / Settings --> signed-in + verification guidance (no account data)
  -- verify email + new tokens --> signed-in (emailVerified = true)
  -- sign out --> guest on Home

signed-in (emailVerified = true)
  -- open Profile / Orders / Settings --> account content
  -- open /login --> leave auth page for Home (or safe returnTo)
  -- sign out --> guest on Home
```

### Account

Shopper identity as shown by the storefront after Auth0 accepts the user.

| Field | Type | Source / rules |
| --- | --- | --- |
| `subject` | string | Auth0 `sub`. Required. Never shown as a secret; may be used as a stable key. |
| `displayName` | string \| null | `name` or `nickname` when present and non-empty. |
| `email` | string \| null | `email` when present. |
| `photoUrl` | string \| null | `picture` when present; must not fall back to a hardcoded stock photo of a fake person. |
| `emailVerified` | boolean | `email_verified === true`. If the claim is missing, treat as `true` (tenant does not require verification). |
| `isFullyUsable` | boolean | `emailVerified === true`. Gates Profile / Orders / Settings **content**. |

**Validation**:
- Do not invent a display name (no “Jordan Nakamura”).
- If `displayName` and `photoUrl` are both missing, UI uses a neutral control (initials from email local-part, or a generic mark).
- `isFullyUsable` is a storefront UX gate only. Privileged API authorization stays on Auth0 + services.

### ReturnDestination

The in-app page to restore after hosted login.

| Field | Type | Rules |
| --- | --- | --- |
| `path` | string | Relative path beginning with `/`. |
| `isSafe` | boolean | True only if the path is an allowed storefront location (see research.md and contracts). |

**Validation**:
- Capture from the current location when a guest is sent to `/login` from a protected URL, or from an explicit `returnTo` query if present and safe.
- Default when starting from header Sign in / Sign up: Home (`/`).
- Unsafe, missing, or off-site values become `/`.

### AuthPageMode

Mode of the single dedicated page.

| Field | Type | Rules |
| --- | --- | --- |
| `mode` | `sign-in` \| `sign-up` | From `?mode=`. Invalid or missing → `sign-in`. |
| `canSwitch` | true | Visitor may switch before `loginWithRedirect`. |

Header **Sign in** → `/login?mode=sign-in` (plus `returnTo` when applicable).  
Header **Sign up** → `/login?mode=sign-up`.

### SessionError

| Field | Type | Rules |
| --- | --- | --- |
| `code` | string | Auth0 `error`, `missing_config`, or `callback_failed`. |
| `message` | string | Visitor-safe copy. No tokens, domains-as-secrets, or stack traces in the UI. |
| `canRetry` | boolean | True for hosted-login failures; retry stays on `/login`. |

### Auth0 hosted login (external)

Not stored by MarketCustoms. Auth0 owns credential forms, duplicate-identifier messaging, and forgot-password. The storefront only starts the redirect and accepts the callback.

## Relationships

```text
VisitorSession 1 -- 0..1 Account
VisitorSession 0..1 -- 0..1 ReturnDestination   (while authenticating)
AuthPageMode is URL state on /login, not persisted in the session
```

## Mapping notes

| Storefront | Auth0 React SDK |
| --- | --- |
| `status: authenticating` | `isLoading` or handling `/callback` |
| `status: signed-in` | `isAuthenticated && user` |
| `status: guest` | otherwise |
| `account.emailVerified` | `user.email_verified` |
| logout | `logout({ logoutParams: { returnTo: origin + "/" } })` |
| start sign-up | `loginWithRedirect({ authorizationParams: { screen_hint: "signup" }, appState: { returnTo } })` |
