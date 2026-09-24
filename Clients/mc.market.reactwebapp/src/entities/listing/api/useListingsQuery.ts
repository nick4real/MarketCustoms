import { useQuery } from "@tanstack/react-query";
import { getListings } from "./listings";
import {
  useAppliedListingSearch,
  type AppliedListingSearch,
} from "../store/listingStore";

export const listingsQueryKey = (applied: AppliedListingSearch) =>
  [
    "listings",
    applied.searchId, // Comment it to use cached results
    applied.categoryId,
    applied.sort,
    applied.searchText,
    applied.pageIndex,
    applied.pageSize,
  ] as const;

export function useListingsQuery() {
  const applied = useAppliedListingSearch();

  return useQuery({
    queryKey: listingsQueryKey(applied),
    queryFn: ({ signal }) =>
      getListings(
        {
          pageIndex: applied.pageIndex,
          pageSize: applied.pageSize,
          categoryId: applied.categoryId ?? undefined,
          sort: applied.sort ?? undefined,
          title: applied.searchText ?? undefined,
        },
        signal,
      ),
  });
}
