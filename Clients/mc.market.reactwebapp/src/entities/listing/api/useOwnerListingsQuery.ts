import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getListings } from "./listings";

export const OWNER_LISTINGS_PAGE_SIZE = 12;

export const ownerListingsQueryKey = (
  ownerId: string | undefined,
  pageIndex: number,
) => ["listings", "owner", ownerId, pageIndex] as const;

export function useOwnerListingsQuery(
  ownerId: string | undefined,
  pageIndex: number,
) {
  return useQuery({
    queryKey: ownerListingsQueryKey(ownerId, pageIndex),
    queryFn: ({ signal }) =>
      getListings(
        { ownerId, pageIndex, pageSize: OWNER_LISTINGS_PAGE_SIZE },
        signal,
      ),
    // A blank ownerId is dropped from the body, which would fetch every seller's listings.
    enabled: Boolean(ownerId?.trim()),
    placeholderData: keepPreviousData,
  });
}
