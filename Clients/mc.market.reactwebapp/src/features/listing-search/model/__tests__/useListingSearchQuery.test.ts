import { describe, expect, it } from "vitest";
import type { AppliedListingSearch } from "../listingSearchStore";
import {
  isPageChangeOnly,
  listingSearchQueryKey,
} from "../useListingSearchQuery";

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

describe("isPageChangeOnly", () => {
  const key = (overrides: Partial<AppliedListingSearch>) =>
    listingSearchQueryKey({ ...applied, ...overrides });

  it("is true when only the page differs", () => {
    expect(isPageChangeOnly(key({ pageIndex: 1 }), key({ pageIndex: 2 }))).toBe(
      true,
    );
  });

  it("is false when the search itself differs", () => {
    expect(isPageChangeOnly(key({}), key({ condition: "used" }))).toBe(false);
    expect(isPageChangeOnly(key({}), key({ searchId: 1 }))).toBe(false);
    expect(isPageChangeOnly(key({}), key({ pageSize: 24 }))).toBe(false);
  });
});
