# Contract: Storefront authentication routes

Browser routes on the Vite app. The gateway continues to serve the SPA as a catch-all; no new YARP routes.

## Public shopping (no sign-in)

| Method | Path | Layout | Notes |
| --- | --- | --- | --- |
| GET | `/` | MainLayout | Home |
| GET | `/browse` | MainLayout | Browse |
| GET | `/listings/:listingId` | MainLayout | Listing details |

Guests and unverified signed-in users may use these.

## Authentication experience

| Method | Path | Layout | Notes |
| --- | --- | --- | --- |
| GET | `/login` | AuthLayout | Dedicated login/signup page. Query: `mode`, optional `returnTo`, optional `error`. |
| GET | `/callback` | AuthLayout | Auth0 redirect_uri. No shopping chrome. Not a destination users navigate to. |

### `/login` query

| Param | Values | Default |
| --- | --- | --- |
| `mode` | `sign-in` \| `sign-up` | `sign-in` |
| `returnTo` | safe relative path | `/` |
| `error` | opaque code for retry copy | absent |

Signed-in visitors who open `/login` are redirected into the storefront (Home, or safe `returnTo` if it is a public page). They are not asked to authenticate again.

### Header entry points

| Control | Visible when | Navigates to |
| --- | --- | --- |
| Sign in | guest | `/login?mode=sign-in` |
| Sign up | guest | `/login?mode=sign-up` |
| Profile / Orders / Settings | fully usable account | existing paths |
| Sign out | signed in | Auth0 logout → `GET /` as guest |
| Identity control | signed in | Profile if fully usable; otherwise stays signed in without opening account data |

Guest header MUST NOT include Profile, Orders, Settings, or a placeholder identity.

## Account areas (gated)

| Method | Path | Guest | Signed in, not fully usable | Fully usable |
| --- | --- | --- | --- | --- |
| GET | `/profile` | redirect `/login?mode=sign-in&returnTo=/profile` | stay; verification guidance; no account data | existing Profile UI |
| GET | `/orders` | redirect `/login?mode=sign-in&returnTo=/orders` | stay; verification guidance | existing Orders UI |
| GET | `/settings` | redirect `/login?mode=sign-in&returnTo=/settings` | stay; verification guidance | existing Settings UI |

Guards MUST `Navigate` to `/login`. They MUST NOT call `loginWithRedirect` directly (that skips the branded page).

## Safe `returnTo` allowlist

Accept only:

- `/`
- `/browse`
- `/listings/{listingId}` where `listingId` is a non-empty path segment without `/`
- `/profile`
- `/orders`
- `/settings`

Optional query strings on those paths are allowed only if they do not contain `//` or encoded slashes used as open redirects. Everything else becomes `/`.

## Errors

| Situation | HTTP (SPA) | Visitor result |
| --- | --- | --- |
| Hosted login cancelled or denied | still 200 on `/login` | signed out; retry on dedicated page |
| Missing Auth0 env | 200 on public pages; `/login` shows config error | storefront not blank |
| Callback with `error` | 200 then client nav to `/login` | signed out; retry |

No new JSON HTTP APIs are introduced.
