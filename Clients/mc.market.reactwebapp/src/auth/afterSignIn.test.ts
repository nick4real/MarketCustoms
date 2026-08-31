import { describe, expect, it } from "vitest";
import { destinationAfterSignIn } from "./afterSignIn";
import { emailVerificationPath } from "./returnTo";

describe("destinationAfterSignIn", () => {
  it("sends an unverified account to the inbox notice after login from a public page", () => {
    expect(destinationAfterSignIn("/", { isFullyUsable: false })).toBe(
      emailVerificationPath,
    );
    expect(destinationAfterSignIn("/browse", { isFullyUsable: false })).toBe(
      emailVerificationPath,
    );
    expect(destinationAfterSignIn(null, { isFullyUsable: false })).toBe(
      emailVerificationPath,
    );
  });

  it("keeps an unverified return to a blocked account page so the same notice shows there", () => {
    expect(destinationAfterSignIn("/profile", { isFullyUsable: false })).toBe(
      "/profile",
    );
    expect(destinationAfterSignIn("/orders", { isFullyUsable: false })).toBe(
      "/orders",
    );
    expect(destinationAfterSignIn("/settings", { isFullyUsable: false })).toBe(
      "/settings",
    );
  });

  it("returns the sanitized return path when the account is fully usable", () => {
    expect(destinationAfterSignIn("/browse", { isFullyUsable: true })).toBe(
      "/browse",
    );
    expect(destinationAfterSignIn("/profile", { isFullyUsable: true })).toBe(
      "/profile",
    );
  });

  it("falls back to home when there is no account yet", () => {
    expect(destinationAfterSignIn(null, null)).toBe("/");
    expect(destinationAfterSignIn("/browse", null)).toBe("/browse");
  });
});
