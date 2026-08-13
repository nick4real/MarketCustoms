# Quickstart: Product Search and Enhanced View

## Prerequisites

- The catalog API must be available locally.
- The React client must be available locally.

## Validation steps

1. Build the catalog API:

   ```powershell
   dotnet build Services\Catalog\MC.Catalog.API\MC.Catalog.API.csproj
   ```

2. Build the React client:

   ```powershell
   cd Clients\mc.market.reactwebapp
   npm run build
   ```

3. Run the catalog API and the React client using the repo's existing start
   commands.

4. Open the browse page and confirm the catalog grid renders with the enhanced
   product view.

5. Search for a known product name and verify that the results update while the
   search term remains visible.

6. Apply one or more product parameter filters and confirm the result set
   narrows accordingly.

7. Clear the filters and verify the full catalog returns.

8. Open a product detail page and confirm the richer product data is visible,
   including parameter information and fallback behavior for missing images or
   attributes.

## Expected outcomes

- The browse page shows a richer product summary than the current baseline.
- Name search works across the catalog and not only the currently visible page.
- Parameter filters can be combined with name search.
- Empty-state and loading-state behavior remains clear and consistent.
