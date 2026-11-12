import {
  keepPreviousData,
  useQuery,
  type QueryKey,
} from "@tanstack/react-query";
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

// Position of pageIndex in listingSearchQueryKey; update both together (covered by tests).
const PAGE_INDEX_KEY_POSITION = 6;

export const isPageChangeOnly = (previous: QueryKey, next: QueryKey) =>
  previous.length === next.length &&
  previous.every(
    (part, i) => i === PAGE_INDEX_KEY_POSITION || part === next[i],
  );

export function useListingSearchQuery() {
  const applied = useAppliedListingSearch();

  const queryKey = listingSearchQueryKey(applied);

  return useQuery({
    queryKey,
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
    // Keep the current page on screen while paging; a new search shows its loading state.
    placeholderData: (previousData, previousQuery) =>
      previousQuery && isPageChangeOnly(previousQuery.queryKey, queryKey)
        ? keepPreviousData(previousData)
        : undefined,
  });
}
