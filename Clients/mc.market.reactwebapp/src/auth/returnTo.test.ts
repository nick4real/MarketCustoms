import { describe, expect, it } from "vitest";
import { isPublicStorefrontPath, sanitizeReturnTo } from "./returnTo";

describe("sanitizeReturnTo", () => {
  it.each([
    "/",
    "/browse",
    "/profile",
    "/orders",
    "/settings",
    "/verify-email",
    "/listings/abc",
  ])("allows %s", (path) => {
    expect(sanitizeReturnTo(path)).toBe(path);
  });

  it("allows a listing id with a query string", () => {
    expect(sanitizeReturnTo("/listings/leica-m6?from=browse")).toBe(
      "/listings/leica-m6?from=browse",
    );
  });

  it("allows query strings on exact allowlist paths", () => {
    expect(sanitizeReturnTo("/browse?sort=new")).toBe("/browse?sort=new");
  });

  it("falls back to / when the value is missing", () => {
    expect(sanitizeReturnTo(undefined)).toBe("/");
    expect(sanitizeReturnTo(null)).toBe("/");
    expect(sanitizeReturnTo("")).toBe("/");
  });

  it.each([
    "//evil.example",
    "/\\evil",
    "https://evil.example/phish",
    "http://evil.example",
    "javascript:alert(1)",
    "/login",
    "/login?mode=sign-in",
    "/callback",
    "/callback?code=abc",
    "/admin",
    "/listings/",
    "/listings/a/b",
    "/profile/settings",
    "browse",
    "/%2f%2fevil.example",
    "/browse?next=//evil.example",
  ])("rejects %s", (path) => {
    expect(sanitizeReturnTo(path)).toBe("/");
  });
});

describe("isPublicStorefrontPath", () => {
  it("treats home, browse, and listings as public", () => {
    expect(isPublicStorefrontPath("/")).toBe(true);
    expect(isPublicStorefrontPath("/browse")).toBe(true);
    expect(isPublicStorefrontPath("/listings/abc")).toBe(true);
  });

  it("does not treat account paths as public", () => {
    expect(isPublicStorefrontPath("/profile")).toBe(false);
    expect(isPublicStorefrontPath("/orders")).toBe(false);
    expect(isPublicStorefrontPath("/settings")).toBe(false);
    expect(isPublicStorefrontPath("/verify-email")).toBe(false);
  });
});
