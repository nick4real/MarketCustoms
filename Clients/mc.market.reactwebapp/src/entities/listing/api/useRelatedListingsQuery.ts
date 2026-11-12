import { useQuery } from "@tanstack/react-query";
import { selectRelatedListings } from "../lib/selectRelatedListings";
import type { Listing } from "../model/types";
import { getListings } from "./listings";

export const relatedListingsQueryKey = (id: string, categoryId: number) =>
  ["listings", "related", id, categoryId] as const;

export function useRelatedListingsQuery(listing: Listing | undefined) {
  return useQuery({
    queryKey: relatedListingsQueryKey(
      listing?.id ?? "",
      listing?.categoryId ?? 0,
    ),
    queryFn: async ({ signal }) => {
      const page = await getListings(
        { categoryId: listing?.categoryId, pageSize: 5 },
        signal,
      );
      return selectRelatedListings(page.items, listing?.id ?? "");
    },
    enabled: Boolean(listing),
  });
}
