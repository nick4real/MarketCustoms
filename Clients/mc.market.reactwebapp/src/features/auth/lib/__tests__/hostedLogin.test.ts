import { describe, expect, it, vi } from "vitest";
import { buildHostedLoginOptions, startHostedLogin } from "../hostedLogin";

describe("buildHostedLoginOptions", () => {
  it("passes the return path through for sign-in", () => {
    expect(buildHostedLoginOptions("sign-in", "/orders")).toEqual({
      appState: { returnTo: "/orders" },
    });
  });

  it("asks Auth0 for the sign-up screen in sign-up mode", () => {
    expect(buildHostedLoginOptions("sign-up", "/orders")).toEqual({
      appState: { returnTo: "/orders" },
      authorizationParams: { screen_hint: "signup" },
    });
  });

  it("falls back to home for missing or unsafe return paths", () => {
    expect(buildHostedLoginOptions("sign-in").appState.returnTo).toBe("/");
    expect(
      buildHostedLoginOptions("sign-in", "https://evil.example").appState
        .returnTo,
    ).toBe("/");
  });
});

describe("startHostedLogin", () => {
  it("redirects with the built options", async () => {
    const loginWithRedirect = vi.fn().mockResolvedValue(undefined);

    await startHostedLogin(loginWithRedirect, "sign-up", "/profile");

    expect(loginWithRedirect).toHaveBeenCalledWith({
      appState: { returnTo: "/profile" },
      authorizationParams: { screen_hint: "signup" },
    });
  });
});
