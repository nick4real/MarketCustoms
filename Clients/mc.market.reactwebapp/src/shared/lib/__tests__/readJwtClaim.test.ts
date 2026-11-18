import { describe, expect, it } from "vitest";
import { readJwtClaim } from "../readJwtClaim";

function tokenWith(payload: unknown): string {
  const body = btoa(
    String.fromCharCode(...new TextEncoder().encode(JSON.stringify(payload))),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${body}.sig`;
}

describe("readJwtClaim", () => {
  it("returns_claim_from_payload", () => {
    const token = tokenWith({ "https://x/id": "abc", note: "???>>>~~~" });
    expect(token).toMatch(/[-_]/);
    expect(readJwtClaim(token, "https://x/id")).toBe("abc");
    expect(readJwtClaim(token, "note")).toBe("???>>>~~~");
  });

  it("returns_undefined_for_malformed_token", () => {
    expect(readJwtClaim("abc", "x")).toBeUndefined();
    expect(readJwtClaim("a.b", "x")).toBeUndefined();
  });

  it("returns_undefined_for_missing_claim", () => {
    expect(readJwtClaim(tokenWith({ a: 1 }), "b")).toBeUndefined();
  });
});
