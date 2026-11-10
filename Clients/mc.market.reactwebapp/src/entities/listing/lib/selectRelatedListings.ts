import type { ListingView } from "../model/types";

export function selectRelatedListings(
  items: ListingView[],
  currentId: string,
  limit = 4,
): ListingView[] {
  return items.filter((item) => item.id !== currentId).slice(0, limit);
}
