import { describe, expect, it } from "vitest";
import type { AppliedListingSearch } from "../../store/listingStore";
import { listingsQueryKey } from "../useListingsQuery";

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

describe("listingsQueryKey", () => {
  it("includes condition in the listings query key", () => {
    expect(listingsQueryKey({ ...applied, condition: "used" })).toContain(
      "used",
    );
    expect(listingsQueryKey({ ...applied, condition: "used" })).not.toEqual(
      listingsQueryKey({ ...applied, condition: null }),
    );
  });
});
