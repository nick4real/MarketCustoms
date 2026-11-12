import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/entities/listing";
import {
  useAppliedListingSearch,
  type AppliedListingSearch,
} from "./listingSearchStore";

export const listingSearchQueryKey = (applied: AppliedListingSearch) =>
  [
    "listings",
    applied.searchId, // Comment it to use cached results
    applied.categoryId,
    applied.condition,
    applied.sort,
    applied.searchText,
    applied.pageIndex,
    applied.pageSize,
  ] as const;

export function useListingSearchQuery() {
  const applied = useAppliedListingSearch();

  return useQuery({
    queryKey: listingSearchQueryKey(applied),
    queryFn: ({ signal }) =>
      getListings(
        {
          pageIndex: applied.pageIndex,
          pageSize: applied.pageSize,
          categoryId: applied.categoryId ?? undefined,
          condition: applied.condition ?? undefined,
          sort: applied.sort ?? undefined,
          title: applied.searchText ?? undefined,
        },
        signal,
      ),
  });
}
