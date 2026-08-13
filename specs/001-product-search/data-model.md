# Data Model: Product Search and Enhanced View

## ProductCatalogItem

Represents a product as shown in the browse grid.

**Fields**

- `id`: unique product identifier
- `title`: product name
- `description`: short summary shown in the catalog
- `price`: current display price
- `imageLink`: primary image for the card
- `categoryName`: display name for the product category
- `parameterSummary`: short list of key/value attributes shown in the enhanced
  view

**Validation rules**

- `title` is required and used for search.
- `description` must be safe to show in list views.
- `imageLink` may be empty; the UI must fall back to a placeholder image.

## ProductDetail

Represents the full product view shown on the detail page.

**Fields**

- `id`
- `title`
- `description`
- `categoryId`
- `category`
- `createdAt`
- `price`
- `stockQuantity`
- `imageLinks`
- `tags`
- `parameters`

**Relationships**

- Belongs to one `Category`
- Has many `imageLinks`
- Has many `tags`
- Has many `parameters`

**Validation rules**

- `stockQuantity` drives the availability state.
- `parameters` may be empty, but the detail page must still render.

## ProductSearchCriteria

Represents the active search state in the browse experience.

**Fields**

- `searchText`: text entered by the user for name search
- `categoryId`: optional category filter
- `parameterFilters`: selected product parameter filters

**Validation rules**

- `searchText` is trimmed before matching.
- Text matching is case-insensitive.
- Multiple parameter filters are combined with AND behavior.

## ProductParameterFilter

Represents a single key/value constraint used to narrow products.

**Fields**

- `name`
- `value`

**Validation rules**

- A filter only matches products that contain the same parameter name and
  value.
- Empty filter values are ignored.

## ProductCatalogPage

Represents a paginated set of catalog items returned to the browse page.

**Fields**

- `items`
- `pageSize`
- `pageIndex`
- `totalPages`
- `hasPreviousPage`
- `hasNextPage`

**Relationships**

- Contains multiple `ProductCatalogItem` records.

**Validation rules**

- Page state must stay consistent while search and filters change.
