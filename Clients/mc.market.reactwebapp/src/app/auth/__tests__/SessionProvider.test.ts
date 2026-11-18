import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ensureCurrentUserMetadata } from "@/entities/profile";
import { useVisitorSession, type VisitorSessionView } from "@/entities/session";
import { SessionProvider } from "../SessionProvider";

// Mimics @auth0/auth0-react: every token fetch dispatches a new `user` object.
const auth0 = vi.hoisted(() => {
  // A refresh loop stalls after this many calls, so a regression fails on the counts, not a timeout.
  const callCap = 10;
  const listeners = new Set<() => void>();
  let state = { user: { sub: "auth0|seller", name: "Seller" } };
  const behavior = { failForcedRefresh: false };
  const getAccessTokenSilently = vi.fn(
    (options?: { cacheMode?: string }): Promise<string> => {
      if (getAccessTokenSilently.mock.calls.length > callCap) {
        return new Promise(() => {});
      }
      if (behavior.failForcedRefresh && options?.cacheMode === "off") {
        return Promise.reject(new Error("Login required"));
      }
      state = { user: { ...state.user } };
      listeners.forEach((listener) => listener());
      // A JWT whose payload never carries the profile id claim.
      return Promise.resolve(
        `header.${btoa(JSON.stringify({ sub: "auth0|seller" }))}.sig`,
      );
    },
  );
  return {
    behavior,
    callCap,
    getAccessTokenSilently,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    snapshot: () => state,
  };
});

vi.mock("@auth0/auth0-react", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    useAuth0: () => {
      const { user } = useSyncExternalStore(auth0.subscribe, auth0.snapshot);
      return {
        isLoading: false,
        isAuthenticated: true,
        user,
        error: undefined,
        getAccessTokenSilently: auth0.getAccessTokenSilently,
      };
    },
  };
});

vi.mock("@/entities/profile", () => ({
  ensureCurrentUserMetadata: vi.fn(),
}));

vi.mock("@/shared/config", () => ({ isAuth0Configured: true }));

const onSession = vi.fn<(session: VisitorSessionView) => void>();

function SessionProbe() {
  onSession(useVisitorSession());
  return null;
}

function latestSession(): VisitorSessionView | undefined {
  return onSession.mock.lastCall?.[0];
}

// react-dom only touches these members of a container when nothing is rendered into it.
function fakeContainer(): Element {
  return {
    nodeType: 1,
    tagName: "DIV",
    namespaceURI: "http://www.w3.org/1999/xhtml",
    ownerDocument: null,
    addEventListener() {},
    removeEventListener() {},
  } as unknown as Element;
}

async function flush(rounds = 20) {
  for (let i = 0; i < rounds; i += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

describe("SessionProvider", () => {
  let root: Root | null = null;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    // react-dom reads window.event and window.HTMLIFrameElement while committing.
    vi.stubGlobal("window", { HTMLIFrameElement: class {} });
    const ensure = vi.mocked(ensureCurrentUserMetadata);
    ensure.mockImplementation(() =>
      ensure.mock.calls.length <= auth0.callCap
        ? Promise.resolve({
            id: "profile-1",
            displayName: "Seller",
            pictureUrl: null,
            accountType: "Individual",
          })
        : new Promise(() => {}),
    );
  });

  afterEach(async () => {
    await act(async () => root?.unmount());
    root = null;
    auth0.getAccessTokenSilently.mockClear();
    auth0.behavior.failForcedRefresh = false;
    onSession.mockClear();
    vi.mocked(ensureCurrentUserMetadata).mockReset();
    vi.unstubAllGlobals();
  });

  async function renderProvider() {
    await act(async () => {
      root = createRoot(fakeContainer());
      root.render(
        createElement(SessionProvider, null, createElement(SessionProbe)),
      );
    });
    await flush();
  }

  it("refreshes the token at most once when the profile id claim never arrives", async () => {
    await renderProvider();

    const forcedRefreshes = auth0.getAccessTokenSilently.mock.calls.filter(
      ([options]) => options?.cacheMode === "off",
    );
    expect(
      vi.mocked(ensureCurrentUserMetadata).mock.calls.length,
    ).toBeLessThanOrEqual(2);
    expect(forcedRefreshes.length).toBeLessThanOrEqual(1);
  });

  it("keeps the loaded metadata when the forced refresh fails", async () => {
    auth0.behavior.failForcedRefresh = true;

    await renderProvider();

    expect(latestSession()?.status).toBe("signed-in");
    expect(latestSession()?.account?.profileId).toBe("profile-1");
  });
});
