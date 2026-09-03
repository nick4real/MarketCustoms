import { describe, expect, it } from "vitest";
import { mapSessionError } from "./sessionError";

describe("mapSessionError", () => {
  it("maps a profile load failure", () => {
    expect(mapSessionError({ profileFailed: true })).toMatchObject({
      code: "profile_failed",
      canRetry: true,
    });
  });

  it("maps a profile_failed query code from callback", () => {
    expect(mapSessionError({ queryCode: "profile_failed" })?.code).toBe(
      "profile_failed",
    );
  });
});
