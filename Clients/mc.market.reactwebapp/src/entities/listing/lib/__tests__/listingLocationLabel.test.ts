import { describe, expect, it } from "vitest";
import { listingLocationLabel } from "../listingLocationLabel";

describe("listingLocationLabel", () => {
  it("joins city, region and country", () => {
    expect(
      listingLocationLabel({ city: "Tokyo", region: "Kanto", country: "JP" }),
    ).toBe("Tokyo, Kanto, JP");
  });

  it("skips blank parts", () => {
    expect(
      listingLocationLabel({ city: " ", region: null, country: "JP" }),
    ).toBe("JP");
  });

  it("returns a dash when nothing is set", () => {
    expect(listingLocationLabel(null)).toBe("—");
    expect(
      listingLocationLabel({ city: "", region: null, country: null }),
    ).toBe("—");
  });
});
