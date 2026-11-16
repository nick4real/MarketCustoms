import { useQuery } from "@tanstack/react-query";
import { getPublicProfile } from "./profiles";

export const publicProfileQueryKey = (id: string) =>
  ["profiles", "public", id] as const;

export function usePublicProfileQuery(id: string | undefined) {
  return useQuery({
    queryKey: publicProfileQueryKey(id ?? ""),
    queryFn: ({ signal }) => getPublicProfile(id ?? "", signal),
    enabled: Boolean(id),
  });
}
