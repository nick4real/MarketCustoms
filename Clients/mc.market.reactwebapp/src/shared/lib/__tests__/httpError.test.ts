import { describe, expect, it } from "vitest";
import { HttpError, isNotFoundError } from "@/shared/lib/httpError";
import { readResponse } from "@/shared/lib/readJson";

describe("readResponse", () => {
  it("throws an HttpError carrying the status", async () => {
    const err = await readResponse(
      new Response(null, { status: 404 }),
      "Listing request",
    ).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect((err as HttpError).status).toBe(404);
    expect((err as HttpError).message).toBe("Listing request failed (404)");
  });

  it("returns parsed json for ok responses", async () => {
    await expect(
      readResponse(new Response('{"a":1}', { status: 200 }), "X"),
    ).resolves.toEqual({ a: 1 });
  });
});

describe("isNotFoundError", () => {
  it("is true only for a 404 HttpError", () => {
    expect(isNotFoundError(new HttpError(404, "x"))).toBe(true);
    expect(isNotFoundError(new HttpError(500, "x"))).toBe(false);
    expect(isNotFoundError(new Error("Not Found"))).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
  });
});
