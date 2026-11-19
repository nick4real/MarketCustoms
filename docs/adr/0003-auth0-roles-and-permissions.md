# 0003: Auth0 roles and permissions

- **Status:** Accepted
- **Date:** 2026-11-18

## Context

Phase 1 lets sellers manage their own listings and limits category writes to admins. Catalog has to know on each write whether the caller may sell and who they are. A user's account type (`Basic`, `Individual` or `Business`) lives in Profiles, and today nothing in the access token says whether the user can sell. A listing also needs an owner, so Catalog needs the caller's profile id.

## Options considered

1. **Auth0 roles and permissions, plus a profile-id claim.** The API has permissions (`listings:write`, `listings:moderate`, `categories:write`). The `seller` role holds `listings:write`, and `admin` holds every permission. Profiles assigns or removes `seller` through the Management API when the account type changes. A post-login Action puts the profile id in the token. Catalog authorizes from the token alone, with no call to another service. The cost is manual tenant setup and a token that goes stale until it is refreshed.
2. **Catalog asks Profiles for the account type.** No tenant setup and no stale token. But every write needs a call to Profiles, Catalog depends on Profiles being up, and admin rights still need another mechanism.

## Decision

Option 1. Permissions in the token keep Catalog independent of Profiles and give admin rights a place to live. Catalog checks permissions only and never reads role names.

## Consequences

- The tenant needs manual setup: permissions, RBAC, roles, an Action and Management API scopes. The steps are under "Configure Auth0" in the [README](../../README.md#configure-auth0).
- A token issued before an account-type change doesn't show it. The client gets a fresh token after the profile is created and after the account type changes.
- The `app_metadata.is_seller` write and the `is_seller` option of the test identity handler are removed. The `seller` role replaces them.
- `admin` holds every permission of the API, so each new permission has to be added to it by hand.
- If an Auth0 call fails, Profiles saves nothing and the user retries, so the profile and the token can't disagree.
