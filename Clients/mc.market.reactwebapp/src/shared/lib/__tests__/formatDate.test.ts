import { describe, expect, it } from "vitest";
import { formatDate } from "../formatDate";

describe("formatDate", () => {
  it("formats an ISO timestamp as a readable date", () => {
    // Midday UTC keeps the calendar day stable across time zones.
    expect(formatDate("2026-08-15T12:00:00Z", "en-US")).toBe("Aug 15, 2026");
  });

  it("returns the input unchanged when it is not a date", () => {
    expect(formatDate("not a date", "en-US")).toBe("not a date");
  });
});
