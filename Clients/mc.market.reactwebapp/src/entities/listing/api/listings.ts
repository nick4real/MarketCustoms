import type {
  Listing,
  ListingPaginatedResponse,
  ListingSort,
  ListingView,
} from "@/entities/listing/model/types";
import {
  readBoolean,
  readFiniteNumber,
  readResponse,
  readStringNonEmpty,
} from "@/shared/lib/readJson";
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
  const description = readStringNonEmpty(row.description) ?? "";
  const price = readFiniteNumber(row.price);
  const imageId = readStringNonEmpty(row.imageId) ?? "";
  if (!id || !title || price === null) {
    throw new Error("Invalid listing");
  }

  return { id, title, description, price, imageId };
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
  return mapPaginatedListings(await readResponse(response, "Listings request"));
}

export async function getListingById(id: string): Promise<Listing> {
  if (!id) {
    throw new Error("Invalid listing ID");
  }

  const response = await fetch(`${listingsUrl}/${id}`);
  return (await readResponse(response, "Listing request")) as Listing;
}
