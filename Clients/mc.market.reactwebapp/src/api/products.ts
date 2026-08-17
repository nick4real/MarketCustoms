import type {
  CreateProductPayload,
  Product,
  ProductDetail,
  ProductPaginatedResponse,
  ProductSearchCriteria,
} from "../../models/product";

/* API Interfaces (camelCase — ASP.NET Core default JSON serialization) */
interface ApiProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  imageLink: string;
  categoryName: string;
  parameters: ApiProductParameter[];
}

interface ApiCategory {
  id: number;
  name: string;
}

interface ApiProductParameter {
  name: string;
  value: string;
}

interface ApiProductDetail {
  id: string;
  title: string;
  description: string;
  categoryId: number;
  category: ApiCategory;
  createdAt: string;
  price: number;
  stockQuantity: number;
  imageLinks: string[];
  tags: string[];
  parameters: ApiProductParameter[];
}

interface ApiPaginatedResponse<T> {
  items: T[];
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/* Mapping Functions */
function mapProduct(api: ApiProduct): Product {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    price: api.price,
    imageLink: api.imageLink,
    categoryName: api.categoryName,
    parameters: api.parameters ?? [],
  };
}

function mapProductDetail(api: ApiProductDetail): ProductDetail {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    categoryId: api.categoryId,
    category: { id: api.category.id, name: api.category.name },
    createdAt: api.createdAt,
    price: api.price,
    stockQuantity: api.stockQuantity,
    imageLinks: api.imageLinks ?? [],
    tags: api.tags ?? [],
    parameters: api.parameters ?? [],
  };
}

function mapPaginatedResponse(
  api: ApiPaginatedResponse<ApiProduct>,
): ProductPaginatedResponse {
  return {
    items: (api.items ?? []).map(mapProduct),
    pageSize: api.pageSize,
    pageIndex: api.pageIndex,
    totalPages: api.totalPages,
    hasNextPage: api.hasNextPage,
    hasPreviousPage: api.hasPreviousPage,
  };
}

/* Helper Functions */
async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.url}`);
  }
  return response.json() as Promise<T>;
}

/* API Functions */
export async function fetchProducts(
  pageIndex = 1,
  pageSize = 24,
  criteria?: ProductSearchCriteria,
): Promise<ProductPaginatedResponse> {
  const params = new URLSearchParams({
    PageIndex: String(pageIndex),
    PageSize: String(pageSize),
  });

  const hasCriteria =
    (Boolean(criteria?.searchText?.trim()) ||
      Boolean(criteria?.categoryId) ||
      Boolean(criteria?.parameters?.length));

  const request = hasCriteria
    ? fetch(`/api/products?${params}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: criteria?.categoryId ?? null,
          title: criteria?.searchText?.trim() ?? null,
          parameters: (criteria?.parameters ?? []).map((parameter) => ({
            name: parameter.name,
            value: parameter.value,
          })),
        }),
      })
    : fetch(`/api/products?${params}`);

  const data = await parseJson<ApiPaginatedResponse<ApiProduct>>(await request);
  return mapPaginatedResponse(data);
}

export async function fetchProductById(id: string): Promise<ProductDetail> {
  const data = await parseJson<ApiProductDetail>(
    await fetch(`/api/products/${id}`),
  );
  return mapProductDetail(data);
}

export async function createProduct(
  payload: CreateProductPayload,
  accessToken: string,
): Promise<ProductDetail> {
  const data = await parseJson<ApiProductDetail>(
    await fetch("/api/products/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        OwnerId: payload.ownerId,
        Title: payload.title,
        Description: payload.description,
        CategoryId: payload.categoryId,
        Price: payload.price,
        StockQuantity: payload.stockQuantity,
        ImageLinks: payload.imageLinks,
        Tags: payload.tags,
        Parameters: payload.parameters.map(([key, value]) => ({
          Item1: key,
          Item2: value,
        })),
      }),
    }),
  );
  return mapProductDetail(data);
}
