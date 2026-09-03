import { describe, expect, it } from "vitest";
import { toVisitorSession } from "./useVisitorSession";

const user = {
  sub: "auth0|123",
  name: "Ada Lovelace",
  email: "ada@example.com",
  picture: "https://auth0.example/ada.png",
  email_verified: true,
};

const metadata = {
  id: "22222222-2222-2222-2222-222222222222",
  displayName: "Ada L.",
  pictureUrl: "https://cdn.example/ada.png",
  accountType: "Basic",
};

describe("toVisitorSession", () => {
  it("stays authenticating until profile metadata is ready", () => {
    expect(
      toVisitorSession({
        isConfigured: true,
        isLoading: false,
        isAuthenticated: true,
        user,
        error: undefined,
        profile: { status: "loading" },
      }).status,
    ).toBe("authenticating");
  });

  it("signs in with marketplace metadata once the profile is ready", () => {
    const session = toVisitorSession({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: true,
      user,
      error: undefined,
      profile: { status: "ready", metadata },
    });

    expect(session.status).toBe("signed-in");
    expect(session.account).toMatchObject({
      subject: "auth0|123",
      displayName: "Ada L.",
      photoUrl: "https://cdn.example/ada.png",
      email: "ada@example.com",
      profileId: metadata.id,
      accountType: "Basic",
      isFullyUsable: true,
    });
  });

  it("returns a retryable guest error when the profile request fails", () => {
    const session = toVisitorSession({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: true,
      user,
      error: undefined,
      profile: { status: "error" },
    });

    expect(session.status).toBe("guest");
    expect(session.account).toBeNull();
    expect(session.error).toMatchObject({
      code: "profile_failed",
      canRetry: true,
    });
  });
});
