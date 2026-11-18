# Phase 0 (Foundation): design

Date: 2026-11-16
Roadmap: [Phase 0: Foundation](../../development_plan/phases/phase-00-foundation.md)
Scope: CI, branching, repository rules and docs. No application code changes apart from one config value.

## Intent

Put a safety net in place before feature work starts. Every PR and every push to `main` should say whether the backend and the client still build and pass their tests, and a failing check should block the merge.

## Decisions taken while designing

1. **GitHub flow instead of GitLab flow.** `main` is the only long-lived branch. Work happens on short-lived branches merged through PRs. Environments (the `kind` cluster in Phase 4, Azure in Phase 5) are deployment targets, not branches. The remote `staging` and `production` branches have no commits that aren't on `main` (both are 57 commits behind, 0 ahead), so they are deleted.
2. **A single CI workflow** with path-based change detection, instead of one workflow per service. With per-workflow `paths` filters, a required check that never starts leaves the PR waiting forever. A single workflow with one aggregate check avoids that.
3. **No separate definition-of-done document.** The roadmap's Principles section stays the only copy. A new project `CLAUDE.md` links to it.
4. **Lightweight ADRs.** A short template and only new decisions. No ADR looking back at existing choices (Aspire, YARP, Auth0, SQL Server plus MongoDB).
5. **Seeding switches to `IfEmpty`** now.

## Scope

### 1. CI workflow: `.github/workflows/ci.yml`

Replaces `.github/workflows/backend-catalog-ci.yml`, which is deleted.

- **Triggers:** `pull_request` targeting `main`, `push` to `main`, `workflow_dispatch`. No workflow-level `paths` filter.
- **Concurrency:** one run per ref; a new push cancels the previous run on the same PR.
- **Jobs:**
  - `changes`: runs `dorny/paths-filter` and outputs which areas changed.
  - `backend`: a matrix over the changed backend areas. Each entry restores, builds and runs that area's unit and integration test projects (`dotnet test`). Runs on `ubuntu-latest`, which has Docker for the `Aspire.Hosting.Testing` integration tests (they start their own isolated SQL Server/MongoDB containers and need no Auth0 secrets).
  - `client`: in `Clients/mc.market.reactwebapp`, runs `npm ci`, `npm run validate`, `npm run test` and `npm run build`, with npm caching.
  - `ci-ok`: runs `if: always()`, needs every other job, and fails if any of them failed or was cancelled. Skipped jobs count as passing. **This is the only required check.**
- **Areas and paths:**

  | Area | Triggered by | Tests run |
  | --- | --- | --- |
  | `catalog` | `Services/Catalog/**`, `Tests/Catalog/**` | Catalog unit + integration |
  | `profiles` | `Services/Profiles/**`, `Tests/Profiles/**` | Profiles unit + integration |
  | `ordering` | `Services/Ordering/**`, `Tests/Ordering/**` | Ordering unit + integration |
  | `notifications` | `Services/Notifications/**`, `Tests/Notifications/**` | Notifications unit + integration |
  | `shared` | `Tests/Shared/**` | Shared unit |
  | all backend areas | anything shared by every service: `Services/Shared/**`, `Aspire/**`, `Gateway/**`, `Directory.Packages.props`, `Tests/Directory.Build.props`, `MarketCustoms.slnx`, `dotnet-tools.json`, `.github/workflows/ci.yml` | all of the above |
  | `client` | `Clients/mc.market.reactwebapp/**`, `.github/workflows/ci.yml` | client checks |

  The scaffold-only services (Payments, Deliveries, Promotions, Reviews, Conversations, Shopping, Analytics) have no tests, so they get no area. Later phases add an area when a service gets tests.
- **.NET setup:** `actions/setup-dotnet` with `10.0.x`, NuGet caching keyed on `Directory.Packages.props`. The backend jobs build the test projects, not the whole `.slnx` (the `.slnx` contains the client's `.esproj`).
- **Timeouts:** each job has a `timeout-minutes` limit, so a hung container start fails instead of running for 6 hours.

### 2. Branching and the `main` ruleset

Set up by hand in the GitHub settings (the repository is public, so rulesets are free). The plan gives the exact steps.

- Delete the remote `staging` and `production` branches.
- A ruleset on `main`:
  - require a pull request before merging (0 approvals, since this is a solo project);
  - require the `ci-ok` status check to pass, with the branch up to date;
  - block force pushes and deletion.
- Direct pushes to `main` stop. All changes go through PRs, including docs.

### 3. ADRs: `docs/adr/`

- `docs/adr/README.md`: what an ADR is in this project, when to write one (a new technology or library, or an open decision from the roadmap), naming (`NNNN-kebab-title.md`), statuses (Proposed, Accepted, Superseded by NNNN), and an index table.
- `docs/adr/0000-template.md`: Status, Date, Context, Options considered, Decision, Consequences.
- `docs/adr/0001-github-flow.md`: GitHub flow instead of GitLab flow (decision 1).
- `docs/adr/0002-single-ci-workflow.md`: single workflow with change detection and an aggregate required check (decision 2).

### 4. Project `CLAUDE.md` (new, root)

Short. It points to the roadmap, says that the definition of done is in the roadmap's Principles section, that new technology or library choices get an ADR in `docs/adr/`, and that the repository uses GitHub flow (branch, then PR into `main`). No duplicated content.

### 5. Seeding

- `Aspire/MC.Aspire.AppHost/appsettings.json`: `Seeding:Mode` becomes `IfEmpty`.
- `README.md:88`: update the note to say the default is `IfEmpty`, and that `Reset` drops and reseeds on every start.

### 6. Docs

- `ROADMAP.md`:
  - "Where we are today": update the CI bullet and the seeding bullet.
  - Phase 0 section: match this design (single workflow, ruleset, GitHub flow, ADRs 0001 and 0002, no definition-of-done document). Open decision resolved, with a link to ADR 0002.
  - Principles: link the ADR folder.
  - Status column: Phase 0 becomes `In progress` when implementation starts and `Done` once the done-when checks pass.
- `STRUCTURE.md`: add `docs/adr/` and `CLAUDE.md` to the layout, and describe `.github/workflows/ci.yml`.

## Out of scope

- Deployment and CD (Phase 4), Azure (Phase 5).
- Linting or formatting the .NET code (`dotnet format`) and `npm run format:check`. They can be added later if the code already passes them.
- Code coverage, test result reports, Dependabot.
- Cleaning up the stray untracked folders on disk (`Shared/`, `Services/Delivering`, `Services/Financial`, etc. contain only `bin`/`obj`).

## Verification

Workflow files can't be fully tested locally. Checks:

- Locally: the client commands and `dotnet test` for each area pass, so CI starts green. If `actionlint` is available, the workflow passes it.
- On GitHub, after you commit and push (I don't commit unless you ask):
  - [ ] A PR that touches only `Services/Catalog/**` runs the `catalog` backend job and skips the others and `client`.
  - [ ] A PR that touches only the client runs `client` and no backend job.
  - [ ] A PR that touches `Services/Shared/**` runs every backend area.
  - [ ] A deliberately failing test makes `ci-ok` fail, and the ruleset blocks the merge.
  - [ ] `docs/adr/` exists with ADRs 0001 and 0002.
  - [ ] `staging` and `production` no longer exist on the remote.

## Risks

- **Aspire integration tests on GitHub runners** may need the HTTPS dev certificate (`dotnet dev-certs https --trust`) or longer start-up timeouts. The first CI run checks this. A failure is investigated, not hidden by skipping the tests.
- **Required check while the ruleset is new:** a PR opened before `ci.yml` is on `main` never reports `ci-ok`. Merge the CI PR first, then turn on the ruleset.
- **Ruleset and solo work:** requiring PRs slows down tiny docs fixes. That's accepted as part of GitHub flow.

## TDD

Not applicable: workflow, configuration and docs only.

## Amendment (2026-11-17): CI areas and pre-existing test failures

Approved after the original design, following the local verification run.

- **Ordering and Notifications are not CI areas yet.** Their only tests were template placeholders (`WeatherForecastControllerTests`) for scaffold services that don't start. The two template tests are deleted. Each service becomes a CI area when its roadmap phase (2 and 3) gives it real tests. CI areas are now `Catalog`, `Profiles` and `Shared`.
- **Stale Catalog and Profiles tests are fixed first, as a separate change** with its own spec and plan: the Catalog and Profiles unit tests don't compile, and 9 of 12 Profiles integration tests target endpoints that no longer exist. Phase 0 is pushed only after that fix, so the first CI run is green. The broken tests are not skipped or excluded from CI.
