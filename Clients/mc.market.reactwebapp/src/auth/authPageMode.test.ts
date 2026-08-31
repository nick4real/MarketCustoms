import { describe, expect, it } from "vitest";
import { parseAuthPageMode } from "./authPageMode";

describe("parseAuthPageMode", () => {
  it("parses sign-in", () => {
    expect(parseAuthPageMode("sign-in")).toBe("sign-in");
  });

  it("parses sign-up", () => {
    expect(parseAuthPageMode("sign-up")).toBe("sign-up");
  });

  it("defaults invalid values to sign-in", () => {
    expect(parseAuthPageMode("signup")).toBe("sign-in");
    expect(parseAuthPageMode("login")).toBe("sign-in");
    expect(parseAuthPageMode("SIGN-UP")).toBe("sign-in");
  });

  it("defaults missing values to sign-in", () => {
    expect(parseAuthPageMode(undefined)).toBe("sign-in");
    expect(parseAuthPageMode(null)).toBe("sign-in");
    expect(parseAuthPageMode("")).toBe("sign-in");
  });
});
