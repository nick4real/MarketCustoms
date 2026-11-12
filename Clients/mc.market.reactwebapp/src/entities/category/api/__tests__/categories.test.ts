import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getRootCategories,
  mapCategory,
  mapCategoryNode,
  mapRootCategories,
} from "../categories";

describe("mapCategoryNode", () => {
  it("maps a flat category payload", () => {
    expect(
      mapCategoryNode({
        id: 3,
        name: "Electronics",
        childCategories: null,
      }),
    ).toEqual({
      id: 3,
      name: "Electronics",
    });
  });

  it("maps nested child categories", () => {
    expect(
      mapCategoryNode({
        id: 1,
        name: "Electronics",
        childCategories: [
          { id: 2, name: "Computers", childCategories: null },
          {
            id: 4,
            name: "Computers & Laptops",
            childCategories: [
              { id: 5, name: "Laptops", childCategories: null },
            ],
          },
        ],
      }),
    ).toEqual({
      id: 1,
      name: "Electronics",
      childCategories: [
        { id: 2, name: "Computers" },
        {
          id: 4,
          name: "Computers & Laptops",
          childCategories: [{ id: 5, name: "Laptops" }],
        },
      ],
    });
  });

  it("rejects an invalid category payload", () => {
    expect(() => mapCategoryNode({ name: "Electronics" })).toThrow(
      /Invalid category/,
    );
  });
});

describe("mapCategory", () => {
  it("drops child categories from the mapped result", () => {
    expect(
      mapCategory({
        id: 1,
        name: "Books",
        childCategories: [{ id: 2, name: "Fiction", childCategories: null }],
      }),
    ).toEqual({
      id: 1,
      name: "Books",
    });
  });
});

describe("mapRootCategories", () => {
  it("maps a root category array", () => {
    expect(
      mapRootCategories([
        { id: 1, name: "Electronics", childCategories: null },
        { id: 6, name: "Books", childCategories: null },
      ]),
    ).toEqual([
      { id: 1, name: "Electronics" },
      { id: 6, name: "Books" },
    ]);
  });

  it("rejects a non-array payload", () => {
    expect(() => mapRootCategories({ id: 1, name: "Electronics" })).toThrow(
      /Invalid categories response/,
    );
  });
});

describe("getRootCategories", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("maps HTTP 404 to an empty list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    await expect(getRootCategories()).resolves.toEqual([]);
  });

  it("throws on other non-OK statuses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 500 })),
    );

    await expect(getRootCategories()).rejects.toThrow(
      /Categories request failed \(500\)/,
    );
  });
});
