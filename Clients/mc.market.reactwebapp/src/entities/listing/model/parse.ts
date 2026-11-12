import type { ListingCondition, ListingSort } from "./types";

// Values come from the URL, so anything unrecognised is ignored rather than thrown.
export function parseListingSort(value: string | null): ListingSort | null {
  switch (value) {
    case "dateAsc":
    case "dateDesc":
    case "priceAsc":
    case "priceDesc":
    case "popularityAsc":
    case "popularityDesc":
      return value;
    default:
      return null;
  }
}

export function parseListingCondition(
  value: string | null,
): ListingCondition | null {
  switch (value) {
    case "new":
    case "used":
    case "damaged":
      return value;
    default:
      return null;
  }
}
