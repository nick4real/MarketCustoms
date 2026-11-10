import type {
  Listing,
  ListingLocation,
  ListingParameter,
  ListingPaginatedResponse,
  ListingSort,
  ListingView,
  ListingCondition,
} from "@/entities/listing/model/types";
import {
  readBoolean,
  readFiniteNumber,
  readJsonResponse,
  readPositiveInt,
  readStringNonEmpty,
} from "@/shared";
import { parseListingCondition } from "../model/parse";
import { listingSearchBody } from "@/entities/listing/lib/listingSearchBody";

/* Listings API */
const listingsUrl = "/api/listings";

/* Maps */
export function mapListingView(body: unknown): ListingView {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid listing");
  }

  const row = body as Record<string, unknown>;
  const id = readStringNonEmpty(row.id);
  const title = readStringNonEmpty(row.title);
  const rawCondition = readStringNonEmpty(row.condition);
  const description = readStringNonEmpty(row.description) ?? "";
  const price = readFiniteNumber(row.price);
  const imageId = readStringNonEmpty(row.imageId) ?? "";
  if (!id || !title || !rawCondition || price === null) {
    throw new Error("Invalid listing view");
  }

  // The API serialises the enum in PascalCase ("Used"); the UI uses lowercase.
  let condition: ListingCondition | null;
  try {
    condition = parseListingCondition(rawCondition.toLowerCase());
  } catch {
    throw new Error("Invalid listing view");
  }
  if (!condition) {
    throw new Error("Invalid listing view");
  }

  return {
    id,
    title,
    condition,
    description,
    price,
    imageId,
  };
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const text = readStringNonEmpty(item);
    return text ? [text] : [];
  });
}

function mapLocation(value: unknown): ListingLocation | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  return {
    country: readStringNonEmpty(row.country),
    region: readStringNonEmpty(row.region),
    city: readStringNonEmpty(row.city),
  };
}

function mapParameters(value: unknown): ListingParameter[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const { name, value: paramValue } = item as Record<string, unknown>;
    return typeof name === "string" && typeof paramValue === "string"
      ? [{ name, value: paramValue }]
      : [];
  });
}

export function mapListing(body: unknown): Listing {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid listing");
  }

  const row = body as Record<string, unknown>;
  const id = readStringNonEmpty(row.id);
  const ownerId = readStringNonEmpty(row.ownerId);
  const title = readStringNonEmpty(row.title);
  const categoryId = readPositiveInt(row.categoryId);
  const createdAt = readStringNonEmpty(row.createdAt);
  const price = readFiniteNumber(row.price);
  const stock = readFiniteNumber(row.stock);
  const rawCategory = row.category;
  if (!rawCategory || typeof rawCategory !== "object") {
    throw new Error("Invalid listing");
  }
  const categoryRow = rawCategory as Record<string, unknown>;
  const category = {
    id: readPositiveInt(categoryRow.id),
    name: readStringNonEmpty(categoryRow.name),
  };
  if (
    !id ||
    !ownerId ||
    !title ||
    categoryId === null ||
    !createdAt ||
    price === null ||
    stock === null ||
    category.id === null ||
    !category.name
  ) {
    throw new Error("Invalid listing");
  }

  return {
    id,
    ownerId,
    title,
    description: readStringNonEmpty(row.description) ?? "",
    categoryId,
    category: { id: category.id, name: category.name },
    createdAt,
    price,
    stock,
    images: readStringArray(row.images),
    tags: readStringArray(row.tags),
    parameters: mapParameters(row.parameters),
    location: mapLocation(row.location),
    // The detail endpoint does not return these yet.
    condition: null,
    sellerRating: null,
    sellerSales: null,
  };
}

export function mapPaginatedListings(body: unknown): ListingPaginatedResponse {
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

/* API */
export async function getListings(
  input?: {
    pageIndex?: number;
    pageSize?: number;
    categoryId?: number;
    condition?: ListingCondition;
    sort?: ListingSort;
    title?: string;
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
  return mapPaginatedListings(
    await readJsonResponse(response, "Listings request"),
  );
}

export async function getListingById(
  id: string,
  signal?: AbortSignal,
): Promise<Listing> {
  if (!id) {
    throw new Error("Invalid listing ID");
  }

  const response = await fetch(`${listingsUrl}/${id}`, { signal });
  return mapListing(await readJsonResponse(response, "Listing request"));
}
