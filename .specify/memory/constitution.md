<!-- Sync Impact Report
Version change: 0.2.0 -> 1.0.0
Modified principles:
  I. Code Quality -> I. Code Maintenance
  II. Clean Architecture -> II. Clean Architecture (expanded)
  III. Security -> moved to Additional Constraints (Security and Trust)
  IV. User Experience Consistency -> folded into I. Code Maintenance and III. Best Practices
  V. Performance Requirements -> IV. Performance
Added sections:
  III. Best Practices (core principle)
  V. Readability (core principle)
Removed sections:
  Quality Standards (folded into III. Best Practices and Quality Gates)
Deferred items: none
-->
# MarketCustoms Constitution

## Core Principles

### I. Code Maintenance
Every change MUST be easy to understand, easy to revert, and cheap to
extend six months later. Diffs MUST stay narrowly scoped to the stated
requirement. Unrelated refactoring, drive-by cleanup, and unused
abstractions MUST NOT ship in the same change set. New code MUST follow
existing naming, file placement, and error semantics in the touched
bounded context. When a suitable abstraction already exists in that
context, it MUST be reused rather than duplicated. Dead code, commented-out
blocks, and speculative extension points MUST NOT be introduced. User-facing
behavior MUST keep established interaction patterns, labels, navigation,
and error handling unless a deliberate product change is approved.

Rationale: Catalog, Ordering, Notifications, Profiles, Gateway, and the
storefront ship independently. Sprawling diffs and one-off patterns make
later change unsafe and slow review.

### II. Clean Architecture
Backend services MUST keep a strict inward dependency rule. Domain MUST
contain entities and domain rules only and MUST NOT reference Application,
Infrastructure, or API. Application MAY depend only on Domain and shared
application contracts. Infrastructure MUST implement Application
abstractions and MUST NOT leak persistence or Auth0 types into Domain.
API MUST remain a thin composition root: controllers, auth wiring, and
host configuration, with no business rules. Bounded contexts MUST stay
isolated across services. Shared projects MUST contain only cross-cutting
contracts or infrastructure, never feature-specific business rules.
Frontend code MUST keep UI, data access, and mapping separate. Presentational
components MUST NOT contain HTTP, gateway, or persistence details. The
client MUST call the gateway and MUST NOT hardcode service URLs.

Rationale: Crossing layer or context boundaries couples persistence, identity,
and UI details to business rules and makes independent service change unsafe.

### III. Best Practices
Production code MUST follow the patterns already established in this
repository unless a documented exception replaces them. New application
logic MUST have focused unit tests in the matching test project. Persistence
or HTTP composition MUST have integration coverage where that harness
already exists. Lint, type, and test failures on the affected scope MUST
be zero before merge. New warnings MUST be treated as defects. Generated
or machine-assisted code MUST meet the same standard as hand-written code.
Frontend work MUST reuse existing components, copy, empty/loading/error
states, and navigation. Parallel patterns for filters, grids, forms, or
API mapping MUST NOT be invented. List and search APIs MUST bound results
through pagination or filtering.

Rationale: Consistent practices keep defects local, make reviews mechanical,
and prevent each service or page from becoming a private dialect.

### IV. Performance
Features MUST meet acceptable latency, responsiveness, and resource-use
targets for their expected scale. Collection endpoints MUST paginate,
filter, or otherwise bound result size. N+1 queries, unbounded in-memory
collections, and blocking work on request threads MUST be avoided.
User-visible regressions in render time, request time, query cost, or
memory use MUST be measured, explained, and either fixed or explicitly
approved before merge. Performance work MUST prefer low-risk, observable
improvements over speculative optimization. Chatty client-to-gateway
or gateway-to-service sequences MUST NOT be added when an existing
bounded call can carry the data.

Rationale: Catalog browsing and checkout are latency-sensitive. Unbounded
SQL or MongoDB reads and extra hops degrade the storefront under load.

### V. Readability
Code MUST be readable by an engineer who did not write it. Names MUST
reveal intent. Types MUST be explicit at trust boundaries and public
APIs. Units MUST stay small enough that a reader can follow the happy
path without scrolling through unrelated branches. Clever or dense
abstractions MUST NOT replace straightforward control flow. Comments
MUST explain non-obvious intent or constraints, not restate the code.
File and folder layout MUST make the primary use case discoverable
before edge cases. Control flow that cannot be understood from names,
types, and structure MUST be treated as a defect and rewritten.

Rationale: Readability is the precondition for maintenance. Opaque code
hides defects and makes every later change a reverse-engineering task.

## Security and Trust

Protected APIs and user-facing actions MUST authenticate and authorize
every request. New endpoints MUST default to `[Authorize]` until an
explicit anonymous or policy exception is justified. Secrets, connection
strings, and tokens MUST NOT be committed, logged, or returned in
responses. Input MUST be validated at trust boundaries. Services MUST
apply least privilege to data access. The client MUST NOT be trusted as
a source of identity, roles, or prices.

Rationale: Profiles, catalog, and ordering data are sensitive commercial
assets. Auth0 is the identity provider; bypassing it or leaking credentials
creates account-takeover and data-exposure risk.

## Quality Gates

Changes MUST be easy to review, safe to deploy, and straightforward to
revert. Each merge request MUST state intent, scope, and how the change
was validated, in enough detail for another engineer to assess risk
quickly. A change that cannot satisfy a core principle MUST NOT merge
without an explicit, time-bound exception from the project owner.
Runtime development guidance lives in `AGENTS.md`; when that file
conflicts with this constitution, this constitution wins.

## Governance

This constitution supersedes informal practices when they conflict.
Amendments MUST be a documented update to this file, with the version
changed according to semantic versioning: MAJOR for incompatible
governance or principle removals or redefinitions, MINOR for new or
expanded principles, and PATCH for clarifications.

Compliance MUST be checked during review for every change that touches
governed areas. If a change cannot meet a principle, the exception MUST
be explicit, time-bound, and approved by the project owner before merge.

**Version**: 1.0.0 | **Ratified**: 2026-08-13 | **Last Amended**: 2026-09-03
