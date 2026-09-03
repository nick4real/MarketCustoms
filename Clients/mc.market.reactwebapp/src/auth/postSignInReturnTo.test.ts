import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  postSignInReturnToKey,
  savePostSignInReturnTo,
  takePostSignInReturnTo,
} from "./postSignInReturnTo";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
    },
  });
});

afterEach(() => {
  memory.clear();
});

describe("postSignInReturnTo", () => {
  it("sanitizes, stores, and consumes the return path once", () => {
    savePostSignInReturnTo("/profile");
    expect(memory.get(postSignInReturnToKey)).toBe("/profile");
    expect(takePostSignInReturnTo()).toBe("/profile");
    expect(takePostSignInReturnTo()).toBe("/");
  });

  it("rejects callback as a return path", () => {
    savePostSignInReturnTo("/callback?code=abc");
    expect(takePostSignInReturnTo()).toBe("/");
  });
});
