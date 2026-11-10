import { describe, expect, it } from "vitest";
import type { ListingView } from "../../model/types";
import { selectRelatedListings } from "../selectRelatedListings";

const view = (id: string): ListingView => ({
  id,
  title: id,
  condition: "new",
  description: "",
  price: 1,
  imageId: "",
});

describe("selectRelatedListings", () => {
  it("excludes the current listing and caps at 4", () => {
    const items = ["a", "b", "c", "d", "e", "f"].map(view);
    const result = selectRelatedListings(items, "c");
    expect(result.map((i) => i.id)).toEqual(["a", "b", "d", "e"]);
  });

  it("returns empty when only the current listing matches", () => {
    expect(selectRelatedListings([view("a")], "a")).toEqual([]);
  });
});
