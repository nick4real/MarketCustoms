import type { ListingLocation } from "../model/types";

export function listingLocationLabel(location: ListingLocation | null): string {
  if (!location) {
    return "—";
  }
  const parts = [location.city, location.region, location.country]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  return parts.length ? parts.join(", ") : "—";
}
