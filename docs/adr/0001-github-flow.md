# 0001: GitHub flow

- **Status:** Accepted
- **Date:** 2026-11-17

## Context

The repository had three long-lived branches, `main`, `staging` and `production` (GitLab flow with environment branches). `staging` and `production` had no commits that weren't on `main` and were 57 commits behind it, and the only CI workflow triggered on `staging`, so it never ran.

MarketCustoms is a solo portfolio project. The roadmap has two deployment targets: a local `kind` cluster (Phase 4) and an on-demand Azure demo (Phase 5).

## Options considered

1. **GitLab flow with environment branches** (`main` → `staging` → `production`). Each promotion is a merge between branches. The branches drift apart, the same code is built several times, and a solo developer pays the merge cost without getting anything back.
2. **GitHub flow.** `main` is the only long-lived branch and is always releasable. Work happens on short-lived branches merged through pull requests. Environments are deployment targets fed from `main`, not branches.

## Decision

GitHub flow. Deployments are driven by workflows: merges to `main` deploy to the `kind` cluster (Phase 4), and the Azure demo is started by hand (Phase 5, `workflow_dispatch`, optionally behind a GitHub Environment with an approval).

## Consequences

- The remote `staging` and `production` branches are deleted.
- A ruleset on `main` requires a pull request and the `ci-ok` check, and blocks force pushes and deletion. Direct pushes to `main` stop, including for small docs fixes.
- CI triggers only on pull requests into `main` and pushes to `main` (see [0002](0002-single-ci-workflow.md)).
