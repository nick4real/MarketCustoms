import { describe, expect, it } from "vitest";
import { mapCurrentUserMetadata } from "./profiles";

describe("mapCurrentUserMetadata", () => {
  it("maps a successful Profiles payload", () => {
    expect(
      mapCurrentUserMetadata({
        id: "22222222-2222-2222-2222-222222222222",
        displayName: "Ada L.",
        pictureUrl: "https://cdn.example/ada.png",
        accountType: "Basic",
      }),
    ).toEqual({
      id: "22222222-2222-2222-2222-222222222222",
      displayName: "Ada L.",
      pictureUrl: "https://cdn.example/ada.png",
      accountType: "Basic",
    });
  });

  it("treats a missing picture as null", () => {
    expect(
      mapCurrentUserMetadata({
        id: "22222222-2222-2222-2222-222222222222",
        displayName: "Ada L.",
        pictureUrl: null,
        accountType: "Seller",
      }).pictureUrl,
    ).toBeNull();
  });

  it("rejects a payload without an id", () => {
    expect(() =>
      mapCurrentUserMetadata({
        displayName: "Ada L.",
        accountType: "Basic",
      }),
    ).toThrow(/Invalid profile metadata/);
  });
});
