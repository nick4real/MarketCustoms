import { describe, expect, it } from "vitest";
import { parseListingCondition, parseListingSort } from "../parse";

describe("parseListingSort", () => {
  it.each([
    "dateAsc",
    "dateDesc",
    "priceAsc",
    "priceDesc",
    "popularityAsc",
    "popularityDesc",
  ])("accepts %s", (value) => {
    expect(parseListingSort(value)).toBe(value);
  });

  it("returns null for missing or unknown values", () => {
    expect(parseListingSort(null)).toBeNull();
    expect(parseListingSort("")).toBeNull();
    expect(parseListingSort("PriceAsc")).toBeNull();
    expect(parseListingSort("cheapest")).toBeNull();
  });
});

describe("parseListingCondition", () => {
  it.each(["new", "used", "damaged"])("accepts %s", (value) => {
    expect(parseListingCondition(value)).toBe(value);
  });

  it("returns null for missing or unknown values", () => {
    expect(parseListingCondition(null)).toBeNull();
    expect(parseListingCondition("")).toBeNull();
    expect(parseListingCondition("New")).toBeNull();
    expect(parseListingCondition("refurbished")).toBeNull();
  });
});
