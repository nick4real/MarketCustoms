import { useQuery } from "@tanstack/react-query";
import { getRootCategories } from "./categories";

export const rootCategoriesQueryKey = () => ["categories"] as const;

export function useRootCategoriesQuery() {
  return useQuery({
    queryKey: rootCategoriesQueryKey(),
    queryFn: ({ signal }) => getRootCategories(signal),
  });
}
