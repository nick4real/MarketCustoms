import { describe, expect, it } from "vitest";
import { accountTypeOptions, isSellerAccountType } from "../accountTypeOptions";

describe("accountTypeOptions", () => {
  it("lists Basic, Individual, Business in order", () => {
    expect(accountTypeOptions.map((o) => o.value)).toEqual([
      "Basic",
      "Individual",
      "Business",
    ]);
  });
});

describe("isSellerAccountType", () => {
  it("is true for Individual and Business", () => {
    expect(isSellerAccountType("Individual")).toBe(true);
    expect(isSellerAccountType("Business")).toBe(true);
  });

  it("is false for Basic and null", () => {
    expect(isSellerAccountType("Basic")).toBe(false);
    expect(isSellerAccountType(null)).toBe(false);
  });
});
