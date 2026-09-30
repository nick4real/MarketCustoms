import type { ListingCondition, ListingSort } from "./types";

export function parseListingSort(value: string | null): ListingSort | null {
  if (value === null) {
    return null;
  }
  switch (value) {
    case "dateAsc":
      return "dateAsc";
    case "dateDesc":
      return "dateDesc";
    case "priceAsc":
      return "priceAsc";
    case "priceDesc":
      return "priceDesc";
    case "popularityAsc":
      return "popularityAsc";
    case "popularityDesc":
      return "popularityDesc";
  }
  throw new Error(`Invalid listing sort: ${value}`);
}

export function parseListingCondition(
  value: string | null,
): ListingCondition | null {
  if (value === null) {
    return null;
  }
  switch (value) {
    case "new":
      return "new";
    case "used":
      return "used";
    case "damaged":
      return "damaged";
  }
  throw new Error(`Invalid listing condition: ${value}`);
}
