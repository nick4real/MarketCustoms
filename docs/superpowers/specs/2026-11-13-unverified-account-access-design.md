# Unverified account access — design

Date: 2026-11-13
Scope: frontend only (`Clients/mc.market.reactwebapp`)

## Goal

A user who has signed in but has not verified their email can open **Profile** and **Settings**. From Settings they can see the actions to resend the verification email and to delete the account. Orders stays closed until the email is verified.

## Decisions

- **Frontend only.** The backend has no endpoints yet for resending the verification email or deleting an account. Both buttons are rendered **disabled** with a "Coming soon" hint. Wiring them up is a follow-up.
- **Access:** unverified users can reach Profile and Settings. Orders and `/verify-email` still require a verified email.
- **Delete account** is disabled for every user, not only unverified ones. An enabled button that does nothing would mislead.

## Current behaviour

- `app/routing/AccountGate.tsx` replaces every account route (`profile`, `settings`, `orders`, `verify-email`) with `VerifyEmailPage` when `account.isFullyUsable` is false.
- `showAccountNav` (`entities/session/model/selectors.ts`) is true only for fully usable accounts. It hides the Orders, Profile and Settings header links, and the avatar's link to Profile in `features/auth/ui/AccountControls.tsx`.
- `SettingsPage` is mostly a static mock. Its "Delete account" button has no handler, and there is no resend action.
- `ProfilePage` always shows a hard-coded `VERIFIED` badge.

## Design

### 1. Routing (`app/routing`)

- `AccountGate` only checks that the user is signed in:
  - `authenticating`: shows the loading state.
  - `guest`: redirects to login with `returnTo`.
  - Otherwise: renders `<Outlet />`.
- New `VerifiedGate.tsx`:
  - Renders `VerifyEmailPage` when `session.account` exists and `isFullyUsable` is false.
  - Otherwise renders `<Outlet />`.
- Router tree:

```
AccountGate
├─ profile
├─ settings
└─ VerifiedGate
   ├─ orders
   └─ verify-email  (element: <Navigate to={routes.home} replace />)
```

An unverified user who visits `/verify-email` sees `VerifyEmailPage`. A verified user is redirected to home. Both match current behaviour.

### 2. Session selectors and header nav

`entities/session/model/selectors.ts`:
- `showAccountNav(session)`: `status === "signed-in" && account != null`. It no longer checks `isFullyUsable`.
- New `showOrdersNav(session)`: `status === "signed-in" && account?.isFullyUsable === true`. It is exported from `entities/session/index.ts`.

`widgets/site-header/model/navLinks.ts`:
- Guest or authenticating: `[Browse]`.
- Signed in and unverified: `[Browse, Profile, Settings]`.
- Signed in and verified: `[Browse, Orders, Profile, Settings]`. This is the current order.

`features/auth/ui/AccountControls.tsx` keeps using `showAccountNav`. Because of the new semantics, the avatar links to `/profile` for unverified users too. No code change is expected there.

### 3. Settings page (`pages/settings/ui/SettingsPage.tsx`)

- When `account.emailVerified === false`, the Account section starts with an email verification notice, placed above the avatar row:
  - Text: "Your email {email} isn't verified yet." If there is no email: "Your email isn't verified yet."
  - A short line explaining that orders unlock after verification.
  - A **Resend verification email** button (`variant="outline"`), disabled, with a "Coming soon" hint.
- Security › Danger zone: the **Delete account** button becomes `disabled`, with a "Coming soon" hint below it.
- The notice is page-local UI. It stays in `pages/settings` (pages first) and does not move to a lower layer.

### 4. Profile page (`pages/profile/ui/ProfilePage.tsx`)

- The `VERIFIED` badge renders only when `account?.emailVerified` is true.
- Otherwise: a muted `UNVERIFIED` badge and a "Verify email" link to `routes.settings`.

### 5. Verify-email page (`pages/verify-email/ui/VerifyEmailPage.tsx`)

- Copy: "You're signed in, but orders stay closed until you verify your email. You can still open your profile and settings, and keep browsing the market."
- Actions: **Continue browsing** (primary), **Open settings** (outline, `routes.settings`) and **Browse listings** (outline).

## Unchanged

- `mapAccount`, `toVisitorSession`, `destinationAfterSignIn` and the `LoginPage` redirect to `/verify-email`. After sign-in, an unverified user with `returnTo=/profile` or `/settings` now actually lands there.
- `accountPaths` and `sanitizeReturnTo`.
- The backend.

## Testing

- Unit tests (Vitest):
  - `entities/session/model/__tests__/selectors.test.ts`:
    - `showAccountNav` is true for unverified signed-in users.
    - `showOrdersNav` is true only for verified users.
  - `widgets/site-header/model/__tests__/navLinks.test.ts`: an unverified user gets `[browse, profile, settings]`.
- The route gates and page UI are glue code: no TDD, covered by lint, build and a manual check.
- Verification: `npm run lint`, `npm run test`, `npm run build` in `Clients/mc.market.reactwebapp`.

## Follow-ups (out of scope)

- Profiles endpoints `POST /profiles/me/verification-email` and `DELETE /profiles/me`, using the Auth0 Management API: `POST /api/v2/jobs/verification-email` and `DELETE /api/v2/users/{id}`.
- Enable and wire up both buttons once those endpoints exist.
