import { describe, expect, it } from "vitest";
import {
  mapCategory,
  mapCategoryNode,
  mapRootCategories,
} from "@/features/listings/api/categories";

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
            childCategories: [{ id: 5, name: "Laptops", childCategories: null }],
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
