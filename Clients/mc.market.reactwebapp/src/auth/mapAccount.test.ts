import { describe, expect, it } from "vitest";
import { mapAccount } from "./mapAccount";

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
  });
});
