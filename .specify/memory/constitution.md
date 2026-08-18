<!-- Sync Impact Report
Version change: 0.1.0 -> 0.2.0
Modified principles:
  I. Code Quality First -> I. Code Quality
  II. Testing Is Mandatory -> II. Clean Architecture
  III. User Experience Must Stay Consistent -> III. Security
  IV. Performance Budgets Are Enforced -> IV. User Experience Consistency
  V. Reviewability and Reliability -> V. Performance Requirements
Added sections: Quality Gates
Removed sections: User Experience Consistency (folded into Principle IV), Performance Requirements (folded into Principle V)
Deferred items: none
-->
# MarketCustoms Constitution

## Core Principles

### I. Code Quality
All production changes MUST be readable, maintainable, and narrowly scoped.
Code MUST follow existing project conventions, keep types explicit, and prefer
small, testable units over clever abstractions. Duplication MUST be removed
when a shared abstraction already exists in the same bounded context. Every
change MUST include only the implementation needed to satisfy the requirement;
unrelated refactoring is forbidden in the same change set.

Rationale: Marketplace services and the web client ship independently. Low-quality
or sprawling diffs hide defects and slow review across Catalog, Ordering,
Notifications, Profiles, Gateway, and the web app.

### II. Clean Architecture
Each backend service MUST keep a strict inward dependency rule: Domain MUST NOT
reference Application, Infrastructure, or API; Application MAY depend only on
Domain and shared application contracts; Infrastructure MUST implement
Application abstractions; API MUST remain the composition root. Bounded
contexts MUST stay isolated across services. Shared projects MUST contain only
cross-cutting contracts or infrastructure, never feature-specific business
rules. Frontend code MUST keep UI, data-access, and domain mapping concerns
separated and MUST NOT leak persistence or transport details into presentational
components.

Rationale: MarketCustoms is a multi-service system with Domain, Application,
Infrastructure, and API projects per service. Crossing those boundaries couples
persistence, Auth0, and UI details to business rules and makes change unsafe.

### III. Security
Protected APIs and user-facing actions MUST authenticate and authorize every
request. Secrets, connection strings, and tokens MUST NOT be committed, logged,
or returned in responses. Input MUST be validated at trust boundaries. Services
MUST apply least privilege to data access, and the client MUST NOT be trusted
as a source of identity, roles, or prices. New endpoints MUST default to deny
until an explicit authorization policy is defined.

Rationale: Profiles, catalog, and ordering data are sensitive commercial assets.
Auth0 is the identity provider; bypassing it or leaking credentials creates
account takeover and data-exposure risk.

### IV. User Experience Consistency
Changes that affect user-facing behavior MUST preserve established interaction
patterns, labels, navigation, control placement, and error handling unless a
deliberate UX change is approved. New copy, empty states, loading states, and
controls MUST reuse existing product language and components when they exist.
Any visible inconsistency across the web app or between the app and API error
semantics MUST be treated as a defect and resolved before release.

Rationale: Shoppers and sellers rely on predictable marketplace flows. Divergent
patterns increase support load and make incomplete or failed purchases harder
to recover from.

### V. Performance Requirements
Features MUST meet acceptable latency, responsiveness, and resource-use targets
for their expected scale. List and search endpoints MUST paginate, filter, or
otherwise bound result size. N+1 queries, unbounded collections, and blocking
work on request threads MUST be avoided. User-visible regressions in render
time, request time, query cost, or memory use MUST be measured, explained, and
either fixed or explicitly approved before merge. Performance work MUST prefer
low-risk, observable improvements over speculative optimization.

Rationale: Catalog browsing and checkout are latency-sensitive. Unbounded MongoDB
or SQL reads and chatty gateway calls degrade the storefront under load.

## Quality Standards

The codebase MUST keep lint, type, and test failures at zero on the affected
scope before merge. New warnings MUST be treated as defects unless they are
explicitly documented and approved. Generated or machine-assisted code MUST be
reviewed against the same standard as hand-written code. Behavior changes MUST
be covered by automated tests: new logic MUST include focused unit tests, and
cross-cutting or persistence behavior MUST include integration coverage where
the service already maintains that harness.

## Quality Gates

Changes MUST be easy to review, safe to deploy, and straightforward to revert.
Each merge request MUST state intent, scope, and validation evidence in enough
detail for another engineer to assess risk quickly. Production-facing changes
MUST include rollback-aware implementation choices where practical. A change
that cannot satisfy a core principle MUST NOT merge without an explicit,
time-bound exception from the project owner.

## Governance

This constitution supersedes informal practices when they conflict. Amendments
MUST be made as a documented update to this file, with the version changed
according to semantic versioning: MAJOR for incompatible governance or principle
removals or redefinitions, MINOR for new or expanded principles, and PATCH for
clarifications.

Compliance MUST be checked during review for every change that touches governed
areas. If a change cannot meet a principle, the exception MUST be explicit,
time-bound, and approved by the project owner before merge.

**Version**: 0.2.0 | **Ratified**: 2026-08-13 | **Last Amended**: 2026-08-18
