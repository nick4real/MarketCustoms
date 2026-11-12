import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCategoryById, getCategoryWithChildren } from "@/entities/category";
import { HttpError } from "@/shared/api";
import { loadCategoryLevel } from "../loadCategoryLevel";

vi.mock("@/entities/category", () => ({
  getCategoryById: vi.fn(),
  getCategoryWithChildren: vi.fn(),
}));

const signal = new AbortController().signal;

describe("loadCategoryLevel", () => {
  beforeEach(() => {
    vi.mocked(getCategoryById).mockReset();
    vi.mocked(getCategoryWithChildren).mockReset();
  });

  it("returns the category and its direct children", async () => {
    vi.mocked(getCategoryWithChildren).mockResolvedValue({
      id: 1,
      name: "Electronics",
      childCategories: [
        {
          id: 2,
          name: "Computers",
          childCategories: [{ id: 3, name: "Laptops" }],
        },
      ],
    });

    await expect(loadCategoryLevel(1, signal)).resolves.toEqual({
      category: { id: 1, name: "Electronics" },
      children: [{ id: 2, name: "Computers" }],
    });
  });

  it("falls back to the plain category when the children lookup 404s", async () => {
    vi.mocked(getCategoryWithChildren).mockRejectedValue(
      new HttpError(404, "Not found"),
    );
    vi.mocked(getCategoryById).mockResolvedValue({ id: 3, name: "Laptops" });

    await expect(loadCategoryLevel(3, signal)).resolves.toEqual({
      category: { id: 3, name: "Laptops" },
      children: [],
    });
    expect(getCategoryById).toHaveBeenCalledWith(3, signal);
  });

  it("rethrows errors other than not found", async () => {
    const error = new HttpError(500, "Server error");
    vi.mocked(getCategoryWithChildren).mockRejectedValue(error);

    await expect(loadCategoryLevel(1, signal)).rejects.toBe(error);
    expect(getCategoryById).not.toHaveBeenCalled();
  });
});
