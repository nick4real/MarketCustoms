import { describe, expect, it } from "vitest";
import { listingSearchBody } from "../listingSearchBody";

describe("listingSearchBody", () => {
  it("returns undefined when there is nothing to filter by", () => {
    expect(listingSearchBody()).toBeUndefined();
    expect(listingSearchBody({})).toBeUndefined();
    expect(listingSearchBody({ title: "   " })).toBeUndefined();
  });

  it("keeps set filters and trims the title", () => {
    expect(
      listingSearchBody({
        categoryId: 4,
        sort: "priceAsc",
        condition: "used",
        title: "  camera ",
      }),
    ).toEqual({
      categoryId: 4,
      sort: "priceAsc",
      condition: "used",
      title: "camera",
    });
  });

  it("drops category ids that are not positive integers", () => {
    expect(listingSearchBody({ categoryId: 0 })).toBeUndefined();
    expect(listingSearchBody({ categoryId: -2 })).toBeUndefined();
    expect(listingSearchBody({ categoryId: 1.5 })).toBeUndefined();
    expect(listingSearchBody({ categoryId: 1.5, sort: "dateDesc" })).toEqual({
      sort: "dateDesc",
    });
  });
});
