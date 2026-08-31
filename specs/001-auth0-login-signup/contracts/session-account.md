# Contract: Session and account view model

Internal TypeScript contract between `src/auth` and UI. Not a network API.

## Session snapshot

```ts
type VisitorStatus = "guest" | "authenticating" | "signed-in";

interface AccountView {
  subject: string;
  displayName: string | null;
  email: string | null;
  photoUrl: string | null;
  emailVerified: boolean;
  isFullyUsable: boolean;
}

interface SessionErrorView {
  code: string;
  message: string;
  canRetry: boolean;
}

interface VisitorSessionView {
  status: VisitorStatus;
  account: AccountView | null;
  error: SessionErrorView | null;
}
```

## Mapping from Auth0 `User`

| AccountView | Auth0 `User` |
| --- | --- |
| `subject` | `sub` (required; if missing, treat as guest + error) |
| `displayName` | trim(`name`) or trim(`nickname`) or `null` |
| `email` | `email` or `null` |
| `photoUrl` | `picture` or `null` (never a bundled fake person) |
| `emailVerified` | `email_verified === true` (missing claim → `true`) |
| `isFullyUsable` | `emailVerified` |

Do not copy `updated_at`, identities, or access tokens into the view model.

## UI obligations

| Session | Shopping header | Account pages |
| --- | --- | --- |
| guest | Sign in, Sign up | redirect to `/login` |
| authenticating | no account data, no fake identity | no account data |
| signed-in, not fully usable | identity + sign out; no Profile/Orders/Settings nav | verification guidance (`/verify-email` after login, and on Profile/Orders/Settings) |
| signed-in, fully usable | identity + account nav + sign out | existing page content |

## Forbidden

- Logging or rendering access tokens, ID tokens, or refresh tokens.
- Trusting `AccountView` for prices, roles, or API authorization.
- Fabricating identity when Auth0 has not authenticated the visitor.
