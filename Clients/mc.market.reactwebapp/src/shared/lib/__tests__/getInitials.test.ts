import { describe, expect, it } from "vitest";
import { getInitials } from "@/shared/lib/getInitials";

describe("getInitials", () => {
  it("uses first and last initials for multi-word names", () => {
    expect(getInitials("Ada Byron Lovelace")).toBe("AL");
  });
  it("ignores dots in abbreviated names", () => {
    expect(getInitials("T. Berg")).toBe("TB");
  });
  it("uses the first two letters of a single word", () => {
    expect(getInitials("alice")).toBe("AL");
  });
  it("falls back to the email local part when the name is an email", () => {
    expect(getInitials("bob@x.io", "bob@x.io")).toBe("BO");
  });
  it("falls back to the email when the name is missing", () => {
    expect(getInitials(null, "carol@x.io")).toBe("CA");
  });
  it("returns MC when nothing is usable", () => {
    expect(getInitials("  ", null)).toBe("MC");
  });
});
