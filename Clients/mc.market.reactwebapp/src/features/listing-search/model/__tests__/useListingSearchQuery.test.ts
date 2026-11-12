import { describe, expect, it } from "vitest";
import type { AppliedListingSearch } from "../listingSearchStore";
import { listingSearchQueryKey } from "../useListingSearchQuery";

const applied: AppliedListingSearch = {
  searchText: null,
  sort: null,
  condition: null,
  categoryId: null,
  categoryName: null,
  maxPrice: null,
  minPrice: null,
  pageIndex: 1,
  pageSize: 12,
  searchId: 0,
};

describe("listingSearchQueryKey", () => {
  it("includes condition in the listings query key", () => {
    expect(listingSearchQueryKey({ ...applied, condition: "used" })).toContain(
      "used",
    );
    expect(
      listingSearchQueryKey({ ...applied, condition: "used" }),
    ).not.toEqual(listingSearchQueryKey({ ...applied, condition: null }));
  });
});
