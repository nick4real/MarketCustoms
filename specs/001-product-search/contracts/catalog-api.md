# Catalog API Contract

## Browse products

**Route**: `GET /api/products`

**Purpose**: Return a paginated set of products for the catalog grid.

**Query parameters**

- `PageIndex`
- `PageSize`

**Response fields**

- `items[]`
- `pageSize`
- `pageIndex`
- `totalPages`
- `hasPreviousPage`
- `hasNextPage`

## Filter products

**Route**: `POST /api/products`

**Purpose**: Return a paginated set of products filtered by search criteria.

**Request body**

- `categoryId`
- `title`
- `parameters[]`

**Response fields**

- Same paginated shape as browse products
- Each item must include enough data for the enhanced product view to show the
  product title, description, price, image, and filter-relevant metadata

## Product details

**Route**: `GET /api/products/{productId}`

**Purpose**: Return the full product detail view.

**Response fields**

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

## UI state contract

- `/browse` remains the discovery route.
- `q` in the URL continues to represent the active name search.
- Search and filter state must be recoverable from the current browse URL or
  the selected filter controls.
