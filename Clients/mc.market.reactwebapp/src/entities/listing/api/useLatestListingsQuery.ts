import { useQuery } from "@tanstack/react-query";
import { getListings } from "./listings";

export const latestListingsQueryKey = (pageSize: number) =>
  ["listings", "latest", pageSize] as const;

export function useLatestListingsQuery(pageSize: number) {
  return useQuery({
    queryKey: latestListingsQueryKey(pageSize),
    queryFn: async ({ signal }) =>
      (await getListings({ pageSize }, signal)).items,
  });
}
