# Phase 0: Foundation

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** a safety net and shared rules before any new feature work.

**User story:** as the developer, every push to `main` and every PR tells me whether the backend and the client still build and pass their tests.

**Services touched:** none (repository and docs).

**Spec and plan:** [design](../../superpowers/specs/2026-11-16-phase-0-foundation-design.md), [plan](../../superpowers/plans/2026-11-17-phase-0-foundation.md).

**Scope:**

- Replace the broken `backend-catalog-ci.yml` with a single `ci.yml`: a `changes` job, a backend matrix over the changed areas (Catalog, Profiles, Shared; Ordering and Notifications join in Phases 2 and 3), a `client` job (`npm run validate`, `npm run test`, `npm run build`) and an aggregate `ci-ok` job. Ubuntu runners have Docker, so the Aspire integration tests run there.
- GitHub flow: delete the `staging` and `production` branches, and add a ruleset on `main` that requires a PR and the `ci-ok` check and blocks force pushes and deletion.
- Create `docs/adr/` with a template, ADR 0001 (GitHub flow) and ADR 0002 (single CI workflow).
- A short project `CLAUDE.md` that points to the definition of done above, the ADR rule and the branching model.
- Switch `Seeding:Mode` to `IfEmpty`.

**Out of scope:** deployment (Phase 4), new features, `dotnet format` and `format:check` in CI, coverage, Dependabot.

**New technology:** GitHub Actions (beyond the one broken workflow).

**Open decisions:** resolved. One workflow with change detection ([ADR 0002](../../adr/0002-single-ci-workflow.md)).

**Done when:**

- [x] A PR that touches only Catalog runs only the Catalog backend job. A PR that touches only the client runs only the client checks. A PR that touches `Services/Shared` runs every backend area.
- [x] A deliberately failing test makes `ci-ok` fail, and the ruleset blocks the merge.
- [x] `docs/adr/` exists with ADRs 0001 and 0002.
- [x] `staging` and `production` no longer exist on the remote.
