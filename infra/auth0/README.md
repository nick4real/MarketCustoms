# Auth0 setup

What the Auth0 tenant needs for roles and ownership. The design is in [ADR 0003](../../docs/adr/0003-auth0-roles-and-permissions.md). Do the steps in order.

## Steps

1. **Create the API permissions.** In the API's Permissions tab add `listings:write`, `listings:moderate` and `categories:write`.
2. **Turn on RBAC.** In the API's settings turn on "Enable RBAC" and "Add Permissions in the Access Token". The access token then carries a `permissions` array.
3. **Create the roles.** Create `seller` with `listings:write`, and `admin` with all the API's permissions. Give `admin` every new permission that later phases add.
4. **Set the seller role id.** Copy the `seller` role id into the AppHost parameter `Parameters:Auth0-SellerRoleId` (see "Configure Auth0" in the [README](../../README.md)).
5. **Grant the Management API scopes.** Authorise the machine-to-machine application for the Auth0 Management API with `update:users`, `create:role_members` and `delete:role_members`.
6. **Add the Action.** Create a post-login Action from [actions/add-profile-id-claim.js](actions/add-profile-id-claim.js), deploy it and add it to the Login flow. It copies `app_metadata.profile_id` into the access token as `https://marketcustoms/profile_id`.
7. **Make yourself an admin.** Assign `admin` to your user by hand in the dashboard. Nothing in the app assigns it.

## Verify

Check by hand against the tenant after the steps above.

- [ ] Sign in as a new user. The second access token (decode it at jwt.io) has `https://marketcustoms/profile_id`.
- [ ] In Settings choose "Private seller". The next token has `permissions: ["listings:write"]`.
- [ ] `POST /api/categories` as that user returns 403. As the admin it returns 200.
- [ ] Choose "Not selling yet". The `seller` role is gone from the user in the Auth0 dashboard.
