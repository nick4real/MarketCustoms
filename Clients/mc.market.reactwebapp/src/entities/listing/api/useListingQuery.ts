import { useQuery } from "@tanstack/react-query";
import { getListingById } from "./listings";

export const listingQueryKey = (id: string) => ["listing", id] as const;

export function useListingQuery(id: string | undefined) {
  return useQuery({
    queryKey: listingQueryKey(id ?? ""),
    queryFn: ({ signal }) => getListingById(id ?? "", signal),
    enabled: Boolean(id),
  });
}
