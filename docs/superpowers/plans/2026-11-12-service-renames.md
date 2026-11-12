# Service Renames Implementation Plan

> **For agentic workers:** Executed through the task-storm pipeline: one `dotnet-coder` per task, then a `dotnet-reviewer` checking the task against the working-tree `git diff`. Steps use checkbox (`- [ ]`) syntax for tracking. **No commits.**

**Goal:** Rename five scaffolded services, add a Conversations scaffold, and update the solution, AppHost and docs to match.

**Architecture:** Purely structural. Folders and projects are moved with `git mv`, then the `MC.<Old>` identifiers inside them are replaced as text. The new service copies the existing scaffold layout. No behaviour changes.

**Tech Stack:** .NET 10, `.slnx` solution, Aspire AppHost SDK 13.5.2, EF Core SQL Server.

**Spec:** `docs/superpowers/specs/2026-11-12-service-renames-design.md`

## Global Constraints

- Renames: `Delivering`→`Deliveries`, `Financial`→`Payments`, `Interaction`→`Reviews`, `Promotion`→`Promotions`, `Statistics`→`Analytics`.
- Connection strings: `deliveriesSqlDatabase`, `paymentsSqlDatabase`, `reviewsSqlDatabase`, `promotionsSqlDatabase`, `analyticsSqlDatabase`, `conversationsSqlDatabase`.
- Launch ports of renamed services stay unchanged. Conversations: https `7236`, http `5236`.
- Do not touch `docs/superpowers/` (except this plan's checkboxes), the `Catalog`/`Notifications`/`Ordering`/`Profiles`/`Shopping`/`Shared` services, Gateway, Tests, or the frontend `SiteStatisticsStrip`.
- Preserve each file's encoding. Several files start with a UTF-8 BOM, so edit them without stripping it.
- No TDD: this is project wiring and renames with no domain logic. The build and existing test suite act as the check.
- No commits, no branches.

## Review Focus

1. **Stale build output:** `bin/`, `obj/` and `*.csproj.user` files move along with `git mv`. Stale `obj/project.assets.json` still holds the old project names. Delete `bin/` and `obj/` in every moved or new project, and rename `MC.<Old>.API.csproj.user` to match the new project name.
2. **Lowercase identifiers:** connection-string names are camelCase (`interactionSqlDatabase`). A case-sensitive `MC.Interaction` replace misses them, so they're listed explicitly.
3. **Partial replace:** `Promotion`→`Promotions` must not produce `Promotionss`. Replace the exact token `MC.Promotion.` and `promotionSqlDatabase` only, never a bare `Promotion`.
4. **Solution and AppHost references:** a missed path in `MarketCustoms.slnx` or `MC.Aspire.AppHost.csproj` fails restore. The build in each task catches this.
5. **Leftover empty folders:** after the moves, `Services/<Old>/` must not exist on disk.

---

### Task 0: Baseline

- [ ] **Step 1:** Run `dotnet build MarketCustoms.slnx` and `dotnet test MarketCustoms.slnx` (via `test-runner`) and record the pass/fail counts. Integration tests need Docker. If they fail before any change, record that as the baseline rather than fixing it.

### Task 1: Rename the five scaffolded services

**Files:**
- Move: `Services/{Delivering,Financial,Interaction,Promotion,Statistics}/**` → `Services/{Deliveries,Payments,Reviews,Promotions,Analytics}/**`, including each project folder and `.csproj` `MC.<Old>.<Layer>` → `MC.<New>.<Layer>`
- Modify (inside the moved folders): `MC.<New>.API/Program.cs`, `MC.<New>.API/MC.<New>.API.csproj`, `MC.<New>.Application/MC.<New>.Application.csproj`, `MC.<New>.Application/ServiceCollectionExtension.cs`, `MC.<New>.Infrastructure/MC.<New>.Infrastructure.csproj`, `MC.<New>.Infrastructure/ServiceCollectionExtension.cs`, `MC.<New>.Infrastructure/Persistence/AppDbContext.cs`
- Modify: `MarketCustoms.slnx` (solution folder names and project paths)
- Modify: `Aspire/MC.Aspire.AppHost/MC.Aspire.AppHost.csproj:19-28` (`ProjectReference` paths)

**Interfaces:**
- Produces: projects `MC.{Deliveries,Payments,Reviews,Promotions,Analytics}.{API,Application,Domain,Infrastructure}` with namespaces `MC.<New>.Application`, `MC.<New>.Infrastructure`, `MC.<New>.Infrastructure.Persistence`. Task 2 copies the `Reviews` layout.

- [ ] **Step 1:** For each pair, `git mv Services/<Old> Services/<New>`, then `git mv` each `MC.<Old>.<Layer>` folder and its `MC.<Old>.<Layer>.csproj` to the `MC.<New>` names.
- [ ] **Step 2:** In the moved files, replace `MC.<Old>.` with `MC.<New>.` and `MC.<Old>\` with `MC.<New>\` (namespaces, `using`s, `ProjectReference` paths). Replace the connection-string names according to Global Constraints.
- [ ] **Step 3:** Rename each `MC.<Old>.API.csproj.user` to `MC.<New>.API.csproj.user`, and delete `bin/` and `obj/` under every moved project.
- [ ] **Step 4:** In `MarketCustoms.slnx`, rename each `/Services/<Old>/` folder and its four project paths in place (don't reorder).
- [ ] **Step 5:** In `MC.Aspire.AppHost.csproj`, update the five `ProjectReference` paths in place.
- [ ] **Step 6: Verify**
  - `dotnet build MarketCustoms.slnx` → `Build succeeded`, 0 errors.
  - `git grep -n -E "Delivering|Financial|Interaction|MC\.Promotion\.|MC\.Statistics|statisticsSqlDatabase" -- ':!docs/superpowers'` → no hits.
  - `git grep -n "SqlDatabase" -- Services` → shows the five new connection-string names (`deliveriesSqlDatabase`, `paymentsSqlDatabase`, `reviewsSqlDatabase`, `promotionsSqlDatabase`, `analyticsSqlDatabase`).
  - `ls Services` → no `Delivering`, `Financial`, `Interaction`, `Promotion`, `Statistics`.

### Task 2: Conversations scaffold and docs tables

**Files:**
- Create: `Services/Conversations/MC.Conversations.API/{MC.Conversations.API.csproj, Program.cs, appsettings.json, appsettings.Development.json, Properties/launchSettings.json}`
- Create: `Services/Conversations/MC.Conversations.Application/{MC.Conversations.Application.csproj, ServiceCollectionExtension.cs}`
- Create: `Services/Conversations/MC.Conversations.Domain/MC.Conversations.Domain.csproj`
- Create: `Services/Conversations/MC.Conversations.Infrastructure/{MC.Conversations.Infrastructure.csproj, ServiceCollectionExtension.cs, Persistence/AppDbContext.cs}`
- Modify: `MarketCustoms.slnx` (add a `/Services/Conversations/` folder with four projects, right after the `/Services/Catalog/` folder)
- Modify: `Aspire/MC.Aspire.AppHost/MC.Aspire.AppHost.csproj` (add `..\..\Services\Conversations\MC.Conversations.API\MC.Conversations.API.csproj`)
- Modify: `README.md:33-46`, `STRUCTURE.md:54-67` (service tables)

**Interfaces:**
- Consumes: the Task 1 `Services/Reviews/**` tracked files as the template.
- Produces: namespaces `MC.Conversations.Application`, `MC.Conversations.Infrastructure`, `MC.Conversations.Infrastructure.Persistence`.

- [ ] **Step 1:** Copy only the tracked files of `Services/Reviews` (`git ls-files Services/Reviews`) to `Services/Conversations`, replacing `Reviews` with `Conversations` in paths and contents. Don't copy `bin/`, `obj/` or `*.csproj.user`.
- [ ] **Step 2:** Set the connection string to `conversationsSqlDatabase`. In `launchSettings.json`, set http `applicationUrl` to `http://localhost:5236` and https to `https://localhost:7236;http://localhost:5236`.
- [ ] **Step 3:** Add the slnx folder and the AppHost `ProjectReference`.
- [ ] **Step 4:** Update the service tables in both docs. Use the names and bounded-context text from the spec's "Final service set" table, and keep each file's existing row order (renamed rows stay in place, Conversations goes right after Reviews). README keeps its `Status` column: every renamed service and Conversations are `Scaffolded`.
- [ ] **Step 5: Verify**
  - `dotnet build MarketCustoms.slnx` → `Build succeeded`, 0 errors.
  - `git grep -n "Conversations" -- MarketCustoms.slnx Aspire README.md STRUCTURE.md` → hits in all four.
  - `git grep -n -E "localhost:(5236|7236)"` → only `Services/Conversations/MC.Conversations.API/Properties/launchSettings.json`.

### Task 3: Final verification

- [ ] **Step 1:** Run `dotnet build MarketCustoms.slnx` and `dotnet test MarketCustoms.slnx` (via `test-runner`). The results must match the Task 0 baseline.
- [ ] **Step 2:** Run the spec's success-criteria grep: `git grep -n -E "Delivering|Financial|Interaction|MC\.Promotion\.|MC\.Statistics|statisticsSqlDatabase"`. The only hits should be under `docs/superpowers/`; matches inside this plan and its spec are expected.
- [ ] **Step 3:** Report the changed files from `git status --short`. No commit.
