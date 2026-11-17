# Phase 0 (Foundation): plan

Date: 2026-11-17
Spec: [2026-11-16-phase-0-foundation-design.md](../specs/2026-11-16-phase-0-foundation-design.md)

**TDD:** none of the tasks. Everything is workflow, configuration or docs.

**Who does what:** the tasks are YAML and Markdown, not C# or React, so the main agent does them directly instead of dispatching `dotnet-coder` / `react-coder`. Task 6 uses `test-runner`. Task 7 changes the remote repository and runs only after you approve it.

**One change from the spec:** `gh` is now installed and authenticated, so Task 7 creates the ruleset and deletes the branches with `gh` instead of by hand in the GitHub settings. The outcome is the same.

**No commits:** nothing is committed or pushed unless you ask. Task 7 needs a branch, a commit, a push and a PR, so it waits for your go-ahead.

---

## Task 1: CI workflow

**Files:**
- Create `.github/workflows/ci.yml`
- Delete `.github/workflows/backend-catalog-ci.yml`

**Steps:**
1. Check the current major versions of `actions/checkout`, `actions/setup-dotnet`, `actions/setup-node` and `dorny/paths-filter` (`gh api repos/<owner>/<repo>/releases/latest`) and pin to those majors.
2. Workflow `name: CI`. Triggers: `pull_request` (branches `main`), `push` (branches `main`), `workflow_dispatch`. `concurrency: { group: ci-${{ github.ref }}, cancel-in-progress: true }`. `permissions: contents: read` (plus `pull-requests: read` for paths-filter on PRs).
3. Job `changes` (ubuntu-latest, 5 min):
   - `dorny/paths-filter` with these filters: `Catalog`, `Profiles`, `Ordering`, `Notifications`, `Shared`, `common` and `client`. The paths are the ones in the spec's area table. The `Shared` filter is `Tests/Shared/**`. `common` covers the paths that run all backend areas.
   - A bash step that computes `backend`: a JSON array of area names. If `common` matched, it lists all five areas; otherwise only the matched areas. Outputs: `backend`, `client` (`'true'`/`'false'`).
4. Job `backend` (needs `changes`, `if: needs.changes.outputs.backend != '[]'`, ubuntu-latest, 30 min):
   - `strategy: { fail-fast: false, matrix: { area: ${{ fromJSON(needs.changes.outputs.backend) }} } }`, `name: backend (${{ matrix.area }})`.
   - Steps: checkout; setup-dotnet `10.0.x` with NuGet cache (`cache-dependency-path: Directory.Packages.props`); `dotnet dev-certs https --trust` (spec risk, kept only if needed; see Task 6); for each `Tests/${{ matrix.area }}/*/*.csproj`, run `dotnet test "$proj" --logger "console;verbosity=normal"`. Stop on the first failure (`set -e`).
5. Job `client` (needs `changes`, `if: needs.changes.outputs.client == 'true'`, ubuntu-latest, 15 min, `working-directory: Clients/mc.market.reactwebapp`): checkout; setup-node (Node version matching local, 24) with npm cache on the client's `package-lock.json`; `npm ci`; `npm run validate`; `npm run test`; `npm run build`.
6. Job `ci-ok` (needs `[changes, backend, client]`, `if: always()`, ubuntu-latest, 5 min): fails if any entry in `needs.*.result` is `failure` or `cancelled`. `skipped` counts as passing.
7. Delete `backend-catalog-ci.yml`.

**Verify:**
- The YAML parses (`node -e` with the client's `yaml` dependency if present, otherwise `python -c "import yaml"`), and run `actionlint` through `go run`/docker if one of them is available. If not, report that it was skipped.
- Read the filters against the spec table: every row is present and has the same paths.
- The real check runs on GitHub in Task 7.

## Task 2: ADRs

**Files:**
- Create `docs/adr/README.md`: purpose, when to write one, naming `NNNN-kebab-title.md`, statuses (Proposed / Accepted / Superseded by NNNN), the process (copy the template, take the next number, add it to the index), and an index table.
- Create `docs/adr/0000-template.md`: Status, Date, Context, Options considered, Decision, Consequences.
- Create `docs/adr/0001-github-flow.md`, Accepted: GitLab flow (`main`/`staging`/`production`) vs GitHub flow. Decision: GitHub flow. Environments are deployment targets (Phase 4 `kind`, Phase 5 Azure). Consequences: the ruleset, PR-only changes, the branches are deleted.
- Create `docs/adr/0002-single-ci-workflow.md`, Accepted: a workflow per service vs a single workflow with change detection. Decision: single workflow with `ci-ok` as the only required check. Consequences: new services add a filter and an area. Why per-workflow `paths` filters break required checks.

**Verify:** the links in the index resolve (`ls` each target). Each ADR has every section of the template.

## Task 3: Project `CLAUDE.md`

**Files:** create `CLAUDE.md` at the repository root (it doesn't exist yet).

Content, short:
- Roadmap: `docs/development_plan/ROADMAP.md`. The definition of done is under Principles there.
- New technology or library choices and roadmap open decisions get an ADR in `docs/adr/`.
- Branching: GitHub flow. Short-lived branch, PR into `main`. `ci-ok` must pass.
- Pointers to `README.md` and `STRUCTURE.md`.

**Verify:** the links resolve. No content copied from the roadmap.

## Task 4: Seeding default

**Files:**
- `Aspire/MC.Aspire.AppHost/appsettings.json:10`: `"Mode": "Reset"` becomes `"Mode": "IfEmpty"`.
- `README.md:88`: the default is `IfEmpty`; set `Reset` to drop and reseed on every start, or `None` to skip seeding.

**Verify:** `dotnet build Aspire/MC.Aspire.AppHost` succeeds. `IfEmpty` matches `SeedingMode` (`Services/Shared/MC.Shared.Infrastructure/Seeding/SeedingMode.cs`).

## Task 5: Roadmap and structure docs

**Files:**
- `docs/development_plan/ROADMAP.md`:
  - "Where we are today": the CI bullet describes `ci.yml` (single workflow, `ci-ok`, GitHub flow); the seeding bullet says `IfEmpty`.
  - Phase overview: Phase 0 demo text matches the new scope; status `In progress`.
  - Phase 0 section: scope = single workflow, ruleset on `main`, delete `staging`/`production`, ADR folder with 0001/0002, project `CLAUDE.md`, seeding `IfEmpty`. Remove "Write down the definition of done…". Open decision marked resolved with a link to ADR 0002. Done-when updated to the spec's checklist.
  - Principles: the "docs updated" bullet and the ADR bullet link `docs/adr/`.
- `STRUCTURE.md`: add `docs/adr/` and `CLAUDE.md` to the layout; describe `.github/workflows/ci.yml` (areas, `ci-ok`).

**Verify:** `git diff` of both files reviewed against the spec section 6. Relative links resolve.

## Task 6: Local verification (`test-runner`)

Run what CI will run, so the first CI run starts green:
- Client: `npm ci`, `npm run validate`, `npm run test`, `npm run build` in `Clients/mc.market.reactwebapp`.
- Backend: `dotnet test` for each of the nine test projects under `Tests/` (Docker must be running for the integration tests).

Any failure is debugged to its root cause first. If an existing test is already broken on `main`, I report it before changing anything.

## Task 7: GitHub (needs your go-ahead to commit and push)

Order matters: the required check must exist on `main` before the ruleset requires it.

1. Create branch `chore/phase-0-foundation`, commit Tasks 1–5, push, open a PR into `main` with `gh pr create`.
2. On the PR: `ci-ok` passes, and since the PR touches `.github/workflows/ci.yml` (in `common`), all five backend areas and `client` run. If the Aspire tests fail on the runner, debug (dev certificate, timeouts) and push fixes.
3. Merge the PR.
4. Delete the remote branches: `git push origin --delete staging production`.
5. Create the ruleset with `gh api repos/nick4real/MarketCustoms/rulesets --method POST --input <json>`: target `branch`, include `refs/heads/main` (`~DEFAULT_BRANCH`), enforcement `active`, rules `pull_request` (0 approvals), `required_status_checks` (`ci-ok`, strict), `non_fast_forward`, `deletion`. No bypass actors.
6. Done-when checks, on throwaway branches whose PRs are closed without merging:
   - a change only under `Services/Catalog/` runs `backend (Catalog)` only;
   - a change only under the client runs `client` only;
   - a change under `Services/Shared/` runs all five backend areas;
   - a deliberately failing test makes `ci-ok` fail, and the PR shows the merge as blocked.
   After the checks, close the PRs and delete the throwaway branches.
7. Set the Phase 0 status in `ROADMAP.md` to `Done` (through a PR, now that the ruleset is on).

**Verify:** `gh api repos/nick4real/MarketCustoms/rulesets`, `git ls-remote --heads origin`, and the PR check results from `gh pr checks`.

## Amendment (2026-11-17)

Approved after Task 6 found pre-existing failures (see the spec amendment).

- Task 1: the `Ordering` and `Notifications` filters and areas are removed. The `common` path set runs `Catalog`, `Profiles` and `Shared`.
- `Tests/Ordering/MC.Ordering.IntegrationTests/Api/WeatherForecastControllerTests.cs` and `Tests/Notifications/MC.Notifications.IntegrationTests/Api/WeatherForecastControllerTests.cs` are deleted.
- Task 7 waits for the separate stale-test fix (its own spec and plan) and a green local run of all CI areas.
- Task 7, step 2: the CI PR runs the `Catalog`, `Profiles` and `Shared` backend areas and `client`. Step 6: "a change under `Services/Shared/` runs all three backend areas".
