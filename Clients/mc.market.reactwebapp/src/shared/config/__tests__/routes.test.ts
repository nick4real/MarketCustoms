import { describe, expect, it } from "vitest";
import { routes } from "../routes";

describe("routes", () => {
  it("encodes listing ids so they stay a single path segment", () => {
    expect(routes.listing("abc")).toBe("/listings/abc");
    expect(routes.listing("a/b?c#d")).toBe("/listings/a%2Fb%3Fc%23d");
  });

  it("builds a category-filtered browse link", () => {
    expect(routes.browseCategory(42)).toBe("/browse?categoryId=42");
  });
});
