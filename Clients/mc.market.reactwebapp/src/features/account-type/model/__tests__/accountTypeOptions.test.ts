import { describe, expect, it } from "vitest";
import {
  accountTypeOptions,
  canSaveAccountType,
  isSellerAccountType,
} from "../accountTypeOptions";

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

describe("canSaveAccountType", () => {
  it("allows a changed selection", () => {
    expect(canSaveAccountType("Individual", "Basic")).toBe(true);
    expect(canSaveAccountType("Basic", "Business")).toBe(true);
  });

  it("allows re-saving an unchanged seller type to repair the seller role", () => {
    expect(canSaveAccountType("Individual", "Individual")).toBe(true);
    expect(canSaveAccountType("Business", "Business")).toBe(true);
  });

  it("blocks re-saving an unchanged basic type", () => {
    expect(canSaveAccountType("Basic", "Basic")).toBe(false);
  });
});
