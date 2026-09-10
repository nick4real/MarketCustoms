import type {
  Listing,
  ListingPaginatedResponse,
} from "@/features/listings/types/listing";

const listingsUrl = "/api/listings";

export async function getListings(
  input?: { pageIndex?: number; pageSize?: number },
  signal?: AbortSignal,
): Promise<ListingPaginatedResponse> {
  const query = new URLSearchParams();
  if (input?.pageIndex) {
    query.set("pageIndex", input.pageIndex.toString());
  }
  if (input?.pageSize) {
    query.set("pageSize", input.pageSize.toString());
  }
  const url = `${listingsUrl}?${query.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    signal,
  });
  if (!response.ok) {
    throw new Error("Failed to fetch listings");
  }
  return response.json() as Promise<ListingPaginatedResponse>;
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
