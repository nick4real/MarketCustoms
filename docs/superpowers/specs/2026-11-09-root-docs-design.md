# Root documentation: README, STRUCTURE, LICENSE

## Goal

Add three markdown files at the repository root so the public GitHub repo
(`nick4real/MarketCustoms`) presents well as a portfolio/showcase project.

## Decisions

- **Audience:** portfolio reviewers and employers. Architecture and stack at a
  glance, plus a short "run it" section. No contribution guide.
- **License:** MIT, `Copyright (c) 2026 nick4real`.
- **Split (approach A):** README is lean and links to STRUCTURE.md; all folder
  and layering detail lives only in STRUCTURE.md. No content duplicated between
  the two. The client's Feature-Sliced Design details stay in
  `Clients/mc.market.reactwebapp/README.md` and are linked, not copied.
- **Honesty about scope:** only Profiles and Catalog are wired into the Aspire
  AppHost. The other nine services are layered scaffolds and must be labelled
  as such.

## `README.md`

1. **Title + tagline** — MarketCustoms, one sentence.
2. **Overview** — one paragraph: marketplace built as .NET Aspire-orchestrated
   microservices with a React storefront.
3. **Tech stack** — grouped list:
   - Backend: .NET 10, ASP.NET Core, EF Core (SQL Server), MongoDB driver,
     FluentValidation, Mapster, Scalar (OpenAPI UI), Bogus (seeding).
   - Platform: .NET Aspire 13, YARP gateway, OpenTelemetry, service discovery,
     HTTP resilience.
   - Auth: Auth0 (JWT bearer on APIs, Auth0 React SDK on the client).
   - Frontend: React 19, Vite, TypeScript, TanStack Query, Zustand, React
     Router, Tailwind CSS 4, Feature-Sliced Design.
   - Testing: xUnit v3, Aspire.Hosting.Testing, Vitest.
4. **Architecture** — Mermaid flowchart: React web app → YARP gateway →
   Profiles / Catalog APIs → SQL Server (both) and MongoDB (Catalog). Auth0 shown
   as external identity provider.
5. **Services** — table with columns *Service*, *Bounded context*, *Status*.
   Profiles and Catalog = Active; Delivering, Financial, Interaction,
   Notifications, Ordering, Promotion, Shopping, Statistics = Scaffolded.
   Shared listed separately as the cross-cutting library.
6. **Getting started**
   - Prerequisites: .NET 10 SDK, Aspire CLI (not in `dotnet-tools.json`, so
     installed globally), Docker (containers for SQL Server, MongoDB,
     Mongo Express), Node.js, an Auth0 tenant.
   - Configure AppHost parameters via user secrets: `Auth0-Domain`,
     `Auth0-Audience`, `Auth0-BackendM2M-ClientId`,
     `Auth0-BackendM2M-ClientSecret`, `Auth0-Frontend-ClientId`.
   - Run: `aspire run` from the root (AppHost path is set in
     `aspire.config.json`). Mention the Aspire dashboard and that SQL Server is
     exposed on host port 14333 with persistent volumes.
7. **Testing** — `dotnet test` for unit and integration tests (integration
   tests use Aspire isolated test composition); `npm run test` inside the
   client.
8. **EF Core migrations** — root `npm run ef:add | ef:remove | ef:list`
   wrappers around `scripts/ef.js`; exact usage verified from the script.
9. **Project structure** — one sentence + link to `STRUCTURE.md`.
10. **License** — one line + link to `LICENSE.md`.

## `STRUCTURE.md`

1. **Top-level tree** — annotated: `Aspire/`, `Clients/`, `Gateway/`,
   `Services/`, `Tests/`, `scripts/`, `.github/workflows/`, plus root files
   (`MarketCustoms.slnx`, `Directory.Packages.props`, `aspire.config.json`,
   `package.json`, `dotnet-tools.json`).
2. **Service layering** — the four-project pattern
   `MC.<Service>.{API, Application, Domain, Infrastructure}`, the dependency
   rule (API → Application → Domain; Infrastructure → Application/Domain),
   and what belongs in each layer. Small Mermaid or text diagram.
3. **Services** — one line per bounded context (same list as README table,
   no status column).
4. **Shared** — `MC.Shared.{API, Application, Infrastructure}`: what each
   provides (e.g. auth defaults, deterministic seeding, request logging),
   verified against the code.
5. **Gateway** — YARP reverse proxy, single external entry point for the
   client.
6. **Aspire** — AppHost (composes containers, services, client; isolated
   test composition) and ServiceDefaults (telemetry, health, discovery,
   resilience).
7. **Clients** — React storefront; link to its README for FSD layers.
8. **Tests** — `Tests/<Service>/MC.<Service>.{UnitTests, IntegrationTests}`
   convention, plus `MC.Shared.UnitTests`.
9. **Conventions** — central package management in `Directory.Packages.props`,
   `MC.` project prefix.

## `LICENSE.md`

Standard MIT license text, `Copyright (c) 2026 nick4real`.

## Verification

- Every claim about a service, Shared feature, command or port is checked
  against the code before being written.
- Mermaid diagrams use GitHub-supported syntax.
- All relative links resolve.
