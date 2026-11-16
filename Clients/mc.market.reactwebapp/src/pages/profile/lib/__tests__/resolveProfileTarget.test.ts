import { describe, expect, it } from "vitest";
import { resolveProfileTarget } from "../resolveProfileTarget";

describe("resolveProfileTarget", () => {
  it("treats a param equal to the account profile as own", () => {
    expect(resolveProfileTarget("p1", "p1")).toEqual({
      profileId: "p1",
      isOwn: true,
    });
  });

  it("treats a different param as another profile", () => {
    expect(resolveProfileTarget("p2", "p1")).toEqual({
      profileId: "p2",
      isOwn: false,
    });
  });

  it("treats a param as another profile for a guest", () => {
    expect(resolveProfileTarget("p2", null)).toEqual({
      profileId: "p2",
      isOwn: false,
    });
  });

  it("falls back to the account profile without a param", () => {
    expect(resolveProfileTarget(undefined, "p1")).toEqual({
      profileId: "p1",
      isOwn: true,
    });
  });

  it("returns no target while the account profile is unknown", () => {
    expect(resolveProfileTarget(undefined, null)).toEqual({
      profileId: null,
      isOwn: false,
    });
  });
});
