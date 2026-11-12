import { describe, expect, it } from "vitest";
import { shouldShowPagination } from "../pagination";

describe("shouldShowPagination", () => {
  it("hides the controls when there is a single page", () => {
    expect(
      shouldShowPagination({ hasPreviousPage: false, hasNextPage: false }),
    ).toBe(false);
  });

  it("shows the controls when another page exists in either direction", () => {
    expect(
      shouldShowPagination({ hasPreviousPage: false, hasNextPage: true }),
    ).toBe(true);
    expect(
      shouldShowPagination({ hasPreviousPage: true, hasNextPage: false }),
    ).toBe(true);
  });
});
