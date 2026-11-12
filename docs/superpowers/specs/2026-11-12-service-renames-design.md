# Service renames — design

## Goal

Give every bounded-context service a name that says what it owns, following one rule:
**a plural domain noun or an established DDD term (`Ordering`); never an adjective; never identical to an aggregate type name** (that would cause CS0118 namespace/type clashes such as `MC.Promotion` and `Promotion`).

The services being renamed are empty scaffolds, so renaming them now costs almost nothing.

## Final service set

| Service | Bounded context | Change |
|---|---|---|
| Catalog | Categories, locations and listings | unchanged |
| Deliveries | Shipping and delivery of orders | renamed from Delivering |
| Payments | Payments, refunds and seller payouts | renamed from Financial |
| Reviews | Buyer reviews and seller ratings | renamed from Interaction |
| Conversations | Buyer–seller messaging about listings | **new scaffold** |
| Notifications | User notifications (SMS/email on events) | unchanged |
| Ordering | Orders placed by buyers | unchanged |
| Profiles | User profiles and account types | unchanged |
| Promotions | Promoted listings and discounts | renamed from Promotion |
| Shopping | Carts, favorites and wishlists | unchanged (scope now includes favorites) |
| Analytics | Marketplace analytics and KPIs | renamed from Statistics |

Favorites move out of the former Interaction scope into Shopping. This only changes documentation, since no code exists yet.

## Renames

For each renamed service `<Old>` → `<New>`:

- Folder `Services/<Old>` → `Services/<New>`, and each project folder and `.csproj` `MC.<Old>.<Layer>` → `MC.<New>.<Layer>`, moved with `git mv` to keep history.
- Every `MC.<Old>` occurrence inside the moved files (namespaces, `using`s, `ProjectReference` paths) → `MC.<New>`.
- Connection-string name in `Infrastructure/ServiceCollectionExtension.cs`:

| Old | New |
|---|---|
| `deliveringSqlDatabase` | `deliveriesSqlDatabase` |
| `financialSqlDatabase` | `paymentsSqlDatabase` |
| `interactionSqlDatabase` | `reviewsSqlDatabase` |
| `promotionSqlDatabase` | `promotionsSqlDatabase` |
| `statisticsSqlDatabase` | `analyticsSqlDatabase` |

- Launch ports stay unchanged.

Outside the service folders:

- `MarketCustoms.slnx`: solution folders and project paths.
- `Aspire/MC.Aspire.AppHost/MC.Aspire.AppHost.csproj`: `ProjectReference` paths.
- `README.md` and `STRUCTURE.md`: service tables, which take the names and bounded-context text from the table above. README status values stay as they are; Conversations is `Scaffolded`.

## New Conversations scaffold

Structurally identical to the Reviews scaffold (the former Interaction):

- `Services/Conversations/MC.Conversations.{API,Application,Domain,Infrastructure}`, with the same csproj contents, `Program.cs`, `ServiceCollectionExtension.cs` files and empty `Persistence/AppDbContext.cs`, with names changed to `Conversations`.
- SQL Server connection string `conversationsSqlDatabase`. The storage choice (SQL Server vs MongoDB) is deferred to the real implementation.
- Launch ports: https `7236`, http `5236` (not used by any other service).
- Added to `MarketCustoms.slnx` under `/Services/Conversations/` and as a `ProjectReference` in the AppHost csproj, like the other scaffolds. No AppHost resource and no gateway route.

## Out of scope

- AppHost resources, gateway routes, Bruno requests and test projects for these services (none exist today).
- Domain code of any kind.
- Historical documents under `docs/superpowers/` (older specs and plans keep the old names).
- The frontend widget `SiteStatisticsStrip`, which is unrelated to the service.
- Commits: none.

## Success criteria

1. `dotnet build MarketCustoms.slnx` succeeds.
2. `dotnet test` passes, the same as before the change.
3. `git grep -n -E "Delivering|Financial|Interaction|MC\.Promotion\.|MC\.Statistics|statisticsSqlDatabase"` matches only files under `docs/superpowers/`. `git grep -n -i "Conversations"` shows the new service in the solution, the AppHost csproj and both docs tables.
