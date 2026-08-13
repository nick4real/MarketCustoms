<!-- Sync Impact Report
Version change: 0.0.0 -> 0.1.0
Modified principles: all five principles rewritten to match requested governance focus
Added sections: Quality Standards, User Experience Consistency, Performance Requirements
Removed sections: none
Deferred items: TODO(RATIFICATION_DATE): original adoption date not available in repository history
-->
# MarketCustoms Constitution

## Core Principles

### I. Code Quality First
All production changes MUST be readable, maintainable, and narrowly scoped. Code
MUST follow existing project conventions, avoid duplication, and prefer small,
testable units over clever abstractions. Every change MUST include the minimum
necessary implementation to satisfy the requirement, with no unrelated
refactoring.

### II. Testing Is Mandatory
Behavior changes MUST be covered by automated tests before merge. New logic MUST
include focused unit tests, and cross-cutting behavior MUST include integration
or end-to-end coverage where applicable. Tests MUST fail for the intended defect
or missing behavior, and fixes MUST not rely on manual verification alone.

### III. User Experience Must Stay Consistent
Changes that affect user-facing behavior MUST preserve established interaction
patterns, labels, flows, and error handling unless a deliberate UX change is
approved. New copy, states, and controls MUST be consistent across the product,
and any visible inconsistency MUST be treated as a defect.

### IV. Performance Budgets Are Enforced
Features MUST meet acceptable latency, responsiveness, and resource-use targets
for their expected scale. Regressions in render time, request time, query cost,
or memory use MUST be measured, explained, and either fixed or explicitly
approved. Performance work MUST prefer low-risk, observable improvements over
speculative optimization.

### V. Reviewability and Reliability
Changes MUST be easy to review, safe to deploy, and straightforward to revert.
Each merge request MUST state intent, scope, and validation evidence in enough
detail for another engineer to assess risk quickly. Production-facing changes
MUST include rollback-aware implementation choices where practical.

## Quality Standards

The codebase MUST keep lint, type, and test failures at zero on the affected
scope before changes are merged. New warnings MUST be treated as defects unless
they are explicitly documented and approved. Generated or machine-assisted code
MUST be reviewed with the same standard as hand-written code.

## User Experience Consistency

Existing terminology, navigation, control placement, and error semantics MUST be
preserved unless the change is intentionally redefining the experience. Cross-
surface inconsistencies MUST be resolved before release, and new patterns SHOULD
reuse established components or flows when available.

## Performance Requirements

Performance-sensitive code MUST define the relevant budget before release when a
budget is meaningful. Changes with user-visible impact MUST be validated against
that budget, and any regression MUST be documented with root cause and mitigation.
Heavy operations SHOULD be deferred, batched, cached, or paged when those
techniques preserve correctness.

## Governance

This constitution supersedes informal practices when they conflict. Amendments
MUST be made as a documented update to this file, with the version changed
according to semantic versioning: MAJOR for incompatible governance changes,
MINOR for new or expanded principles, and PATCH for clarifications.

Compliance MUST be checked during review for every change that touches governed
areas. If a change cannot meet a principle, the exception MUST be explicit,
time-bound, and approved by the project owner before merge.

**Version**: 0.1.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-08-13
