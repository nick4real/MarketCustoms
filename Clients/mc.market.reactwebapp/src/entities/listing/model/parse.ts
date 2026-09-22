import type { ListingCondition, ListingSort } from "./types";

export function parseListingSort(value: string | null): ListingSort | null {
  if (value === null) {
    return null;
  }
  switch (value) {
    case "newest":
      return "newest";
    case "priceAsc":
      return "priceAsc";
    case "priceDesc":
      return "priceDesc";
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
    case "refurbished":
      return "refurbished";
    case "damaged":
      return "damaged";
  }
  throw new Error(`Invalid listing condition: ${value}`);
}
