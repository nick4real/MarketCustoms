# 0002: Single CI workflow

- **Status:** Accepted
- **Date:** 2026-11-17

## Context

CI has to build and test each backend service, the shared libraries and the React client on every pull request into `main` and every push to `main`. A change should run only the checks it affects, and a failing check must block the merge through a required status check.

## Options considered

1. **One workflow per service**, each with its own `paths` filter. Simple to read, but a workflow that a `paths` filter skips never reports its check. If that check is required, the pull request waits for it forever, so per-service checks can't be made required.
2. **A single workflow with change detection.** A `changes` job works out which areas changed. The test jobs run only for those areas. A final aggregate job reports one result.

## Decision

A single workflow, `.github/workflows/ci.yml`:

- `changes` uses `dorny/paths-filter` to detect the changed areas. Changes to files every service depends on (`Services/Shared`, `Aspire`, `Gateway`, central build files, the workflow itself) run all backend areas.
- `backend` is a matrix with one entry per changed backend area, each running that area's test projects under `Tests/<Area>/`.
- `client` runs `npm ci`, `validate`, `test` and `build` for the React client.
- `ci-ok` always runs and fails if any other job failed or was cancelled; skipped jobs count as passing. It is the only required check on `main`.

## Consequences

- One required check, whatever the change touches.
- When a service gets tests, its area is added to the `changes` filters and to the list of all areas in the same workflow.
- The workflow file is longer than a per-service one, and the area list lives in one place that has to be kept up to date.
