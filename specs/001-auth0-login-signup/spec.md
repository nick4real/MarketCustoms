# Feature Specification: Auth0 Login and Signup

**Feature Branch**: `001-auth0-login-signup`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "Add auth0 authentication to react app. Create dedicated page and layout for login/signup page."

## Clarifications

### Session 2026-08-31

- Q: Where should visitors enter their email and password (or finish Auth0’s login and signup steps)? → A: Dedicated MarketCustoms page is the branded start; credentials are entered on Auth0’s hosted login, then the visitor returns to the storefront
- Q: When a guest is browsing the public storefront, which account-related controls should they see in the shopping header? → A: Guest header shows Sign in and Sign up; hide Profile, Orders, Settings, and placeholder identity until signed in
- Q: If Auth0 requires a new visitor to verify their email before the account is fully usable, what should they be able to do in MarketCustoms right after sign-up? → A: Signed in for public browsing; Profile, Orders, and Settings stay blocked until email is verified; they see what to do next
- Q: When a guest chooses Sign in versus Sign up on the public storefront, should the dedicated page already be set to that choice? → A: Sign in opens the dedicated page in sign-in mode; Sign up opens it in sign-up mode; they can still switch before going to Auth0

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in on a dedicated authentication page (Priority: P1)

A returning visitor opens MarketCustoms and chooses to sign in. They land on a dedicated login/signup page that uses its own authentication layout — not the shopping header, marketplace navigation, search, or cart. That page is the branded start: they choose to sign in there, then enter credentials on Auth0’s hosted login (not on the MarketCustoms page). After Auth0 accepts them, they return to the storefront as themselves.

**Why this priority**: Signed-in identity is the prerequisite for account features. Without this journey, login/signup has no value.

**Independent Test**: Open the dedicated authentication page as a guest, complete sign-in with a valid account, and confirm the storefront treats the visitor as that signed-in user.

**Acceptance Scenarios**:

1. **Given** a visitor is not signed in, **When** they open the login/signup experience, **Then** they see a dedicated authentication layout without shopping chrome (no marketplace navigation, search, cart, or placeholder profile).
2. **Given** the visitor has a valid MarketCustoms account, **When** they complete Auth0’s hosted login successfully, **Then** they are signed in and taken to the storefront (the page they originally tried to open, or Home if they started from sign-in).
3. **Given** sign-in is cancelled, rejected, or fails on Auth0’s hosted login, **When** the attempt ends, **Then** the visitor remains signed out, stays on or returns to the dedicated authentication page, and sees a clear way to retry.

---

### User Story 2 - Create an account from the same page (Priority: P1)

A new visitor opens the same dedicated login/signup page and chooses to create an account. They start on that page, then create the account on Auth0’s hosted login. After Auth0 accepts the new account, they return to the storefront already signed in. If Auth0 requires email verification before the account is fully usable, they can browse public pages but cannot see Profile, Orders, or Settings content until they verify.

**Why this priority**: The requested experience is login *and* signup. New shoppers cannot use account features until they can register.

**Independent Test**: Complete sign-up as a new user from the dedicated page and confirm the storefront treats them as signed in; if email verification is required, confirm they can browse but cannot see Profile, Orders, or Settings content.

**Acceptance Scenarios**:

1. **Given** a visitor is not signed in, **When** they choose sign up on the dedicated page, **Then** they can create an account without using the shopping layout.
2. **Given** they complete Auth0’s hosted sign-up successfully, **When** Auth0 accepts the new account, **Then** they land in the storefront signed in.
3. **Given** the identifier they use is already registered, **When** they try to sign up on Auth0’s hosted login, **Then** they are told an account already exists and can switch to sign-in there or return to the dedicated page to choose sign-in.
4. **Given** Auth0 requires email verification and the new account is not yet verified, **When** they try to open Profile, Orders, or Settings, **Then** they do not see account data, they stay signed in for public browsing, and they are told what to do next (they are not treated as signed out or sent to the dedicated authentication page).

---

### User Story 3 - Reach sign-in from the storefront and protected account areas (Priority: P2)

Guests may browse the public marketplace. The shopping header offers Sign in and Sign up; it does not show Profile, Orders, Settings, or a placeholder identity. Sign in opens the dedicated page already set to sign-in; Sign up opens it already set to sign-up; the visitor can still switch before Auth0’s hosted login. If a guest still opens an account area (by URL or other means), they are sent to the dedicated authentication page instead of seeing another person's data or placeholder account content. After they sign in, they return to the page they wanted, and the header then shows signed-in account controls.

**Why this priority**: Entry points and protection make sign-in discoverable and stop guests from seeing account screens. This story depends on sign-in/sign-up working.

**Independent Test**: Confirm the guest header shows Sign in and Sign up only; follow Sign in and land in sign-in mode; follow Sign up and land in sign-up mode; open Profile while signed out (by URL) and land on the auth page; after sign-in, arrive at Profile with signed-in header controls.

**Acceptance Scenarios**:

1. **Given** a guest is on the public storefront, **When** they view the shopping header, **Then** they see Sign in and Sign up and do not see Profile, Orders, Settings, or a placeholder identity.
2. **Given** a guest is on the public storefront, **When** they choose Sign in, **Then** they are taken to the dedicated authentication page already set to sign-in.
3. **Given** a guest is on the public storefront, **When** they choose Sign up, **Then** they are taken to the dedicated authentication page already set to sign-up, and they can still switch to sign-in before going to Auth0.
4. **Given** a guest opens Profile, Orders, or Settings (including by URL), **When** the destination loads, **Then** they are sent to the dedicated authentication page instead of seeing account content.
5. **Given** they were sent to authentication from a protected page, **When** they complete sign-in with a fully usable account, **Then** they return to that page already signed in and the shopping header shows signed-in account controls.
6. **Given** they were sent to authentication from a protected page and Auth0 requires email verification that is not yet complete, **When** they finish sign-up, **Then** they return toward that page but do not see account data; they see what to do next and can still browse public pages.
7. **Given** a guest is viewing Home, Browse, or a listing, **When** they use those pages, **Then** they can continue browsing without being forced to sign in.

---

### User Story 4 - Stay signed in and sign out (Priority: P2)

A signed-in shopper stays signed in across refresh and later visits in the same browser until they sign out or the session expires. The shopping header then shows signed-in account controls (not Sign in / Sign up). They can sign out from the storefront and continue as a guest, with the guest header restored. The authentication layout is only for sign-in and sign-up, not for everyday shopping.

**Why this priority**: Session continuity and sign-out complete the identity lifecycle. This story needs sign-in already working.

**Independent Test**: Sign in, refresh, confirm still signed in; sign out, confirm guest state on a public page.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they refresh or reopen the storefront in the same browser before the session expires, **Then** they remain signed in without entering credentials again.
2. **Given** a signed-in user, **When** they sign out, **Then** they become a guest, land on a public storefront page (not a protected account page), and the shopping header shows Sign in and Sign up instead of account controls.
3. **Given** a signed-in user, **When** they open the login/signup page, **Then** they are sent into the storefront instead of being asked to sign in again.

---

### Edge Cases

- Visitor starts sign-in or sign-up and cancels or closes Auth0’s hosted login before finishing — they remain signed out and can retry from the dedicated page.
- Auth0 is unreachable or not configured — the visitor sees a recoverable error on the authentication experience, not a blank or broken storefront.
- After sign-in, the intended return page is missing, not a storefront page, or would send the user off-site — they go to Home instead.
- Sign-up uses an identifier that already belongs to an account — Auth0’s hosted login guides them to sign in rather than creating a duplicate.
- The identity provider requires email verification before the account is fully usable — the visitor remains signed in for public browsing, is told what to do next, and is not shown Profile, Orders, or Settings data until they verify. They are not treated as signed out.
- Multiple browser tabs: signing in or out in one tab does not leave another tab showing the wrong identity as if it were authoritative; a refresh shows the current session.
- Network failure during Auth0 hosted login or the return to the storefront — the visitor can retry from the dedicated page; they are not left in a half-signed-in state.
- Signed-in users with no display name or photo — the storefront shows a neutral signed-in control, not a hardcoded fake person.
- A guest who knows a Profile, Orders, or Settings URL still cannot see account content; they are sent to the dedicated authentication page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The storefront MUST provide a dedicated login/signup page that is separate from shopping pages.
- **FR-002**: That page MUST use a dedicated authentication layout that does not include marketplace navigation, search, cart, or a placeholder profile identity.
- **FR-003**: Sign-in and sign-up MUST be performed through Auth0 as the identity provider. The storefront MUST NOT invent or trust a locally fabricated identity, and MUST NOT collect passwords on the dedicated page.
- **FR-004**: Visitors MUST be able to start sign-in from the dedicated page and complete it on Auth0’s hosted login.
- **FR-005**: Visitors MUST be able to start account creation from the same dedicated page and layout and complete it on Auth0’s hosted login.
- **FR-006**: Visitors MUST be able to choose sign-in or sign-up on the dedicated page (and switch between those choices) before they are sent to Auth0’s hosted login. Storefront Sign in MUST open the dedicated page already set to sign-in; storefront Sign up MUST open it already set to sign-up.
- **FR-007**: The public storefront shopping header MUST offer Sign in and Sign up (or equivalent labeled actions) when the visitor is not signed in, and MUST NOT show Profile, Orders, Settings, or a placeholder identity.
- **FR-008**: Profile, Orders, and Settings MUST require a signed-in user whose account is fully usable. Guests who open those areas (including by URL) MUST be sent to the dedicated authentication page. After sign-in with a fully usable account, those areas MAY appear in the shopping header.
- **FR-009**: Home, Browse, and listing details MUST remain usable without signing in.
- **FR-010**: After successful sign-in or sign-up, the visitor MUST return to the storefront page they originally tried to open when that page is a legitimate in-app destination; otherwise they MUST go to Home.
- **FR-011**: A successful session MUST persist across page refresh and later visits in the same browser until the user signs out or the session expires.
- **FR-012**: Signed-in users MUST be able to sign out from the storefront and continue as a guest on a public page.
- **FR-013**: A signed-in user who opens the login/signup page MUST be sent into the storefront rather than repeating authentication.
- **FR-014**: Failed, cancelled, or interrupted Auth0 hosted login MUST leave the visitor signed out, with a clear message and a way to retry from the dedicated page.
- **FR-015**: When signed in, storefront chrome MUST reflect a signed-in state (and the user's real display attributes when available) instead of a hardcoded placeholder person, including account navigation that was hidden while they were a guest.
- **FR-016**: The authentication layout MUST reuse MarketCustoms brand language (name/logo and existing product tone) while remaining visually distinct from the shopping layout.
- **FR-017**: Secrets, connection details, and tokens MUST NOT be shown in the interface, logged to the visitor, or left in page copy.
- **FR-018**: Visitors MUST be able to recover access to an existing account (forgotten password) via Auth0’s hosted login, reachable from the dedicated page.
- **FR-019**: The storefront MUST NOT be treated as the source of roles, prices, or identity for privileged actions; Auth0 and marketplace services remain the authority after sign-in.
- **FR-020**: The dedicated page MUST send the visitor to Auth0’s hosted login to enter credentials, then receive them back into the storefront after Auth0 completes or cancels the attempt.
- **FR-021**: When Auth0 requires email verification before an account is fully usable, a visitor who has signed up but not yet verified MUST remain signed in for Home, Browse, and listing details, MUST NOT see Profile, Orders, or Settings content, MUST be told what to do next, and MUST NOT be treated as signed out or sent to the dedicated authentication page solely because verification is pending.

### Key Entities

- **Visitor session**: Whether the current browser visit is signed in, and which account it belongs to, until sign-out or expiry.
- **Account**: The shopper or seller identity established by Auth0 (identifier, display attributes such as name, email, or photo when the provider supplies them, and whether the account is fully usable — including email verification when Auth0 requires it).
- **Return destination**: The in-app page the visitor was trying to reach before authentication; used only when it is a safe storefront location.
- **Auth0 hosted login**: Auth0’s own login and signup screens, where credentials are entered after the visitor leaves the dedicated MarketCustoms page and before they return to the storefront.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new visitor can create an account from the dedicated page and arrive in the storefront signed in in under 2 minutes.
- **SC-002**: A returning visitor can complete sign-in from the dedicated page in under 1 minute.
- **SC-003**: Every attempt to open Profile, Orders, or Settings while signed out results in the dedicated authentication experience rather than account content. Every attempt to open those areas while signed in but not yet email-verified (when Auth0 requires verification) results in guidance to verify rather than account content or a sign-out.
- **SC-004**: After sign-in, visitors who came from a protected page return to that page in 100% of successful attempts.
- **SC-005**: Signed-in visitors remain signed in after refresh without entering credentials again (until sign-out or session expiry).
- **SC-006**: Unsigned visitors can browse listings end to end without being required to sign in.
- **SC-007**: At least 95% of successful sign-in or sign-up attempts land on a usable storefront page rather than an error or blank screen.
- **SC-008**: First-time users can tell the authentication layout apart from the shopping layout immediately (no cart, no marketplace navigation).
- **SC-009**: After sign-up, a visitor whose email is not yet verified (when Auth0 requires it) can still complete a public browse of Home, Browse, or a listing without being forced through sign-in again.

## Assumptions

- Backend marketplace services already authenticate with Auth0. This feature is the storefront sign-in, sign-up, session, and layout surface; it does not redefine API authorization contracts.
- Email-and-password (and any methods already enabled on the existing Auth0 tenant) is sufficient. Additional social providers, multi-factor authentication, organization/B2B login, and a custom login domain are out of scope unless they are already required by the tenant.
- Completing a first-time profile or seller onboarding after sign-up is a separate feature.
- Guest browsing of Home, Browse, and listing details is intentional for this marketplace.
- Login and signup share one dedicated page and layout; they are modes of the same experience, not a second shopping-style page. That page starts Auth0’s hosted login; visitors type credentials on Auth0’s hosted login, not on MarketCustoms.
- Copy on the authentication experience follows existing MarketCustoms tone (concise, brand-consistent) rather than introducing a new product voice.
- After sign-out, Home is an acceptable public landing page.
