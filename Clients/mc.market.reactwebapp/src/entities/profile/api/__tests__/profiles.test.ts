import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clarifyAccountType,
  mapCurrentUserMetadata,
  mapPublicProfile,
} from "../profiles";

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
    expect(() =>
      mapPublicProfile({ ...valid, displayName: undefined }),
    ).toThrow(/Invalid public profile/);
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

describe("clarifyAccountType", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("clarifyAccountType_posts_account_type_with_bearer_token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await clarifyAccountType("t", "Business");

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/profiles/me/clarify-account-type");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer t",
    );
    expect(init.body).toBe('{"accountType":"Business"}');
  });

  it("clarifyAccountType_throws_on_error_response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 400 })),
    );

    await expect(clarifyAccountType("t", "Basic")).rejects.toThrow(/400/);
  });
});
