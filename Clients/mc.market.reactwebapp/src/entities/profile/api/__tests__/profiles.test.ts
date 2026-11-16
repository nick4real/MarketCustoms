import { describe, expect, it } from "vitest";
import { mapCurrentUserMetadata, mapPublicProfile } from "../profiles";

describe("mapPublicProfile", () => {
  const valid = {
    id: "22222222-2222-2222-2222-222222222222",
    displayName: "Ada L.",
    pictureUrl: "https://cdn.example/ada.png",
    bio: "Hi",
    isSeller: true,
  };

  it("maps a public profile payload", () => {
    expect(mapPublicProfile(valid)).toEqual(valid);
  });

  it("treats missing picture and bio as null", () => {
    const { pictureUrl, bio } = mapPublicProfile({
      id: valid.id,
      displayName: valid.displayName,
      isSeller: false,
    });
    expect(pictureUrl).toBeNull();
    expect(bio).toBeNull();
  });

  it("rejects a payload without an id", () => {
    expect(() => mapPublicProfile({ ...valid, id: undefined })).toThrow(
      /Invalid public profile/,
    );
  });

  it("rejects a payload without a display name", () => {
    expect(() => mapPublicProfile({ ...valid, displayName: undefined })).toThrow(
      /Invalid public profile/,
    );
  });

  it("rejects a payload where isSeller is not boolean", () => {
    expect(() => mapPublicProfile({ ...valid, isSeller: "yes" })).toThrow(
      /Invalid public profile/,
    );
  });
});

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
