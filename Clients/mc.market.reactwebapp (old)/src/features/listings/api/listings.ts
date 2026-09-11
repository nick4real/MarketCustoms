import type {
  Listing,
  ListingPaginatedResponse,
  ListingParams,
  ListingSort,
  ListingView,
} from "@/features/listings/types/listing";

const listingsUrl = "/api/listings";

function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function mapListingView(body: unknown): ListingView {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid listing");
  }

  const row = body as Record<string, unknown>;
  const id = nonEmpty(row.id);
  const title = nonEmpty(row.title);
  const description = typeof row.description === "string" ? row.description : "";
  const price = readFiniteNumber(row.price);
  const imageId = typeof row.imageId === "string" ? row.imageId : "";
  if (!id || !title || price === null) {
    throw new Error("Invalid listing");
  }

  return { id, title, description, price, imageId };
}

export function mapListingPage(body: unknown): ListingPaginatedResponse {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid listings response");
  }

  const row = body as Record<string, unknown>;
  if (!Array.isArray(row.items)) {
    throw new Error("Invalid listings response");
  }

  const pageSize = readFiniteNumber(row.pageSize);
  const pageIndex = readFiniteNumber(row.pageIndex);
  const totalPages = readFiniteNumber(row.totalPages);
  const hasNextPage = readBoolean(row.hasNextPage);
  const hasPreviousPage = readBoolean(row.hasPreviousPage);
  if (
    pageSize === null ||
    pageIndex === null ||
    totalPages === null ||
    hasNextPage === null ||
    hasPreviousPage === null
  ) {
    throw new Error("Invalid listings response");
  }

  return {
    items: row.items.map(mapListingView),
    pageSize,
    pageIndex,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
}

function listingSearchBody(
  input?: ListingParams,
): ListingParams | undefined {
  const body: ListingParams = {};
  if (
    input?.categoryId !== undefined &&
    Number.isInteger(input.categoryId) &&
    input.categoryId > 0
  ) {
    body.categoryId = input.categoryId;
  }
  if (input?.sort) {
    body.sort = input.sort;
  }

  return body.categoryId !== undefined || body.sort !== undefined
    ? body
    : undefined;
}

export async function getListings(
  input?: {
    pageIndex?: number;
    pageSize?: number;
    categoryId?: number;
    sort?: ListingSort;
  },
  signal?: AbortSignal,
): Promise<ListingPaginatedResponse> {
  const query = new URLSearchParams();
  if (input?.pageIndex && input.pageIndex > 0) {
    query.set("pageIndex", input.pageIndex.toString());
  }
  if (input?.pageSize) {
    query.set("pageSize", input.pageSize.toString());
  }

  const qs = query.toString();
  const url = qs ? `${listingsUrl}?${qs}` : listingsUrl;
  const body = listingSearchBody(input);
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    signal,
    ...(body
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }

  return mapListingPage(await response.json());
}

export async function getListingById(id: string): Promise<Listing> {
  if (!id) {
    throw new Error("Invalid listing ID");
  }

  const response = await fetch(`${listingsUrl}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch listing");
  }
  return response.json() as Promise<Listing>;
}
