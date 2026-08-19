# MarketCustoms agent guide

Marketplace platform: .NET 10 microservices behind a YARP gateway, React storefront, Auth0 identity, Aspire local orchestration.

Governance lives in `.specify/memory/constitution.md`. Follow it. Spec-driven work uses Spec Kit skills under `.cursor/skills/` and artifacts under `specs/`.

## Layout

| Path | Role |
| --- | --- |
| `Services/<Context>/MC.<Context>.{Domain,Application,Infrastructure,API}` | Bounded context (Catalog, Ordering, Notifications, Profiles) |
| `Shared/` | Cross-cutting contracts only (`MC.Shared.{API,Application,Infrastructure}`) |
| `Gateway/MC.Gateway` | YARP reverse proxy; browser talks here, not to services |
| `Clients/MC.Market.WebApp` | Vite + React 19 + TypeScript + Tailwind 4 + Auth0 |
| `Aspire/` | App host and service defaults |
| `Tests/<Context>/MC.<Context>.{Unit,Integration}Tests` | xUnit v3 |
| `specs/` | Feature specs, plans, tasks, contracts |

Solution file: `MarketCustoms.slnx`. Target framework: `net10.0`. Nullable and implicit usings are on.

Aspire developer graph currently wires **Profiles, Catalog, Gateway, and the Vite app**. Ordering and Notifications exist but are not in that graph unless you add them.

## Backend architecture

Keep the inward dependency rule:

- **Domain** — entities and domain rules. No Application, Infrastructure, or API references.
- **Application** — use-case services, requests/responses, validators, repository/service interfaces. Depends on Domain only (plus shared application contracts).
- **Infrastructure** — EF Core / Mongo, Auth0 management, repositories. Implements Application interfaces.
- **API** — composition root: `Program.cs`, controllers, auth wiring. Thin; no business rules.

Do not put feature-specific business rules in `Shared/`. Do not leak persistence or Auth0 types into Domain.

Patterns already in use:

- Controllers inherit `CustomController` and return `HandleResult(...)`.
- New endpoints default to `[Authorize]` until an explicit anonymous or policy is justified.
- Application services behind `I<Name>Service`; persistence behind repository interfaces and `IUnitOfWork`.
- Development/test identity can use `Authentication:UseLocalTestIdentity` and `LocalTestAuthenticationHandler`. Production path is Auth0 (`AddAuth0ApiAuthentication`).

## Frontend architecture

Keep UI, data access, and mapping separate:

- `src/pages/` — routes
- `src/components/` — presentational UI
- `src/api/` — HTTP to the gateway; map API DTOs to `src/models/`
- `src/auth/` — Auth0 config and onboarding gates
- `src/layouts/` — shell

Reuse existing components, copy, empty/loading/error states, and navigation. Do not invent parallel patterns for filters, grids, or forms.

The client is not a source of identity, roles, or prices. Call the gateway; do not hardcode service URLs.

## Security

- Never commit, log, or return secrets, connection strings, or tokens.
- Validate at trust boundaries. Least privilege on data access.
- Do not trust the SPA for authorization decisions.

## Testing and quality

- New application logic: focused unit tests in `Tests/<Context>/MC.<Context>.UnitTests`.
- Persistence or HTTP composition: integration tests where that harness already exists.
- Backend tests use xUnit v3 (`xunit.v3.mtp-off`).
- Frontend: `npm run lint` and `npm run build` (`tsc -b && vite build`) in `Clients/MC.Market.WebApp`.
- Zero lint/type/test failures on the affected scope. Treat new warnings as defects.
- List/search APIs must bound results (paginate or filter). Avoid N+1 and unbounded collections.

## How to run

- Local stack: Aspire AppHost (`Aspire/MC.Aspire.AppHost`). SQL Server and MongoDB run as persistent containers.
- Web app alone: `npm run dev` in `Clients/MC.Market.WebApp` (still needs the gateway for API calls).
- Isolated service tests can set `MarketCustoms:TestService` on the AppHost (see `IsolatedTestComposition`).

## Change discipline

- Narrow diffs. No drive-by refactors.
- Match existing naming, file placement, and error semantics.
- Feature work: read `specs/<feature>/spec.md`, `plan.md`, and `tasks.md` before coding; keep contracts in `specs/<feature>/contracts/` in sync with APIs.
- Merge requests must state intent, scope, and how it was validated.
