import { describe, expect, it } from "vitest";
import {
  applyProfileMetadata,
  displayNameForProfileEnsure,
  mapAccount,
} from "./mapAccount";

describe("mapAccount", () => {
  it("maps sub, name, and picture", () => {
    expect(
      mapAccount({
        sub: "auth0|123",
        name: "Ada Lovelace",
        email: "ada@example.com",
        picture: "https://example.com/ada.png",
        email_verified: true,
      }),
    ).toEqual({
      subject: "auth0|123",
      displayName: "Ada Lovelace",
      email: "ada@example.com",
      photoUrl: "https://example.com/ada.png",
      emailVerified: true,
      isFullyUsable: true,
      profileId: null,
      accountType: null,
    });
  });

  it("uses nickname when name is missing", () => {
    expect(
      mapAccount({
        sub: "auth0|123",
        nickname: "ada",
      })?.displayName,
    ).toBe("ada");
  });

  it("returns null and is treated as guest+error when sub is missing", () => {
    expect(
      mapAccount({
        name: "Ada",
        email: "ada@example.com",
      }),
    ).toBeNull();
    expect(mapAccount(undefined)).toBeNull();
  });

  it("treats a missing email_verified claim as fully usable", () => {
    const account = mapAccount({ sub: "auth0|123" });
    expect(account?.emailVerified).toBe(true);
    expect(account?.isFullyUsable).toBe(true);
  });

  it("marks email_verified false as signed in but not fully usable", () => {
    const account = mapAccount({
      sub: "auth0|123",
      email_verified: false,
    });
    expect(account?.emailVerified).toBe(false);
    expect(account?.isFullyUsable).toBe(false);
  });

  it("treats email_verified true as fully usable", () => {
    const account = mapAccount({
      sub: "auth0|123",
      email_verified: true,
    });
    expect(account?.isFullyUsable).toBe(true);
  });

  it("does not invent a display name or photo", () => {
    const account = mapAccount({ sub: "auth0|123" });
    expect(account?.displayName).toBeNull();
    expect(account?.photoUrl).toBeNull();
    expect(account?.profileId).toBeNull();
    expect(account?.accountType).toBeNull();
  });
});

describe("applyProfileMetadata", () => {
  const account = mapAccount({
    sub: "auth0|123",
    name: "Ada Lovelace",
    email: "ada@example.com",
    picture: "https://auth0.example/ada.png",
  });

  it("overlays marketplace display name, photo, and profile id", () => {
    expect(account).not.toBeNull();
    expect(
      applyProfileMetadata(account!, {
        id: "22222222-2222-2222-2222-222222222222",
        displayName: "Ada L.",
        pictureUrl: "https://cdn.example/ada.png",
        accountType: "Basic",
      }),
    ).toEqual({
      ...account,
      displayName: "Ada L.",
      photoUrl: "https://cdn.example/ada.png",
      profileId: "22222222-2222-2222-2222-222222222222",
      accountType: "Basic",
    });
  });

  it("keeps the Auth0 display name when the profile name is blank", () => {
    expect(account).not.toBeNull();
    expect(
      applyProfileMetadata(account!, {
        id: "22222222-2222-2222-2222-222222222222",
        displayName: "  ",
        pictureUrl: null,
        accountType: "Basic",
      }).displayName,
    ).toBe("Ada Lovelace");
  });
});

describe("displayNameForProfileEnsure", () => {
  it("falls back when Auth0 has no name", () => {
    const account = mapAccount({ sub: "auth0|123" });
    expect(account).not.toBeNull();
    expect(displayNameForProfileEnsure(account!)).toBe("New member");
  });
});
