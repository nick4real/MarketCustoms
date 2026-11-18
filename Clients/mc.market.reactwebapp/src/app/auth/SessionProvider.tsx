import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ensureCurrentUserMetadata } from "@/entities/profile";
import {
  PROFILE_ID_CLAIM,
  SessionActionsContext,
  SessionContextProvider,
  mapAccount,
  toVisitorSession,
  type ProfileLoadState,
  type SessionActions,
} from "@/entities/session";
import { isAuth0Configured } from "@/shared/config";
import { readJwtClaim } from "@/shared/lib";

const idleProfile: ProfileLoadState = { status: "idle" };

export function SessionProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user, error, getAccessTokenSilently } =
    useAuth0();
  const userSub = isAuthenticated ? (user?.sub?.trim() ?? "") : "";
  const [trackedSub, setTrackedSub] = useState("");
  const [profile, setProfile] = useState<ProfileLoadState>(idleProfile);
  const [reloadCount, setReloadCount] = useState(0);
  const forceFreshToken = useRef(false);

  if (userSub !== trackedSub) {
    setTrackedSub(userSub);
    setProfile(userSub ? { status: "loading" } : idleProfile);
  }

  useEffect(() => {
    if (!userSub) {
      return;
    }

    const account = mapAccount(user);
    if (!account) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        const force = forceFreshToken.current;
        forceFreshToken.current = false;
        const token =
          (await (force
            ? getAccessTokenSilently({ cacheMode: "off" })
            : getAccessTokenSilently())) ?? "";
        const metadata = await ensureCurrentUserMetadata(
          token,
          {
            displayName: account.displayName ?? "New member",
            pictureUrl: account.photoUrl,
          },
          controller.signal,
        );
        if (controller.signal.aborted) {
          return;
        }
        // Profiles writes the profile id to Auth0 on first call; a fresh token carries it.
        if (readJwtClaim(token, PROFILE_ID_CLAIM) !== metadata.id) {
          await getAccessTokenSilently({ cacheMode: "off" });
        }
        if (!controller.signal.aborted) {
          setProfile({ status: "ready", metadata });
        }
      } catch (cause) {
        if (controller.signal.aborted) {
          return;
        }
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }
        setProfile({ status: "error" });
      }
    })();

    return () => {
      controller.abort();
    };
  }, [getAccessTokenSilently, reloadCount, user, userSub]);

  const actions = useMemo<SessionActions>(
    () => ({
      getAccessToken: async () => (await getAccessTokenSilently()) ?? "",
      reloadSession: () => {
        forceFreshToken.current = true;
        setReloadCount((count) => count + 1);
      },
    }),
    [getAccessTokenSilently],
  );

  const session = useMemo(
    () =>
      toVisitorSession({
        isConfigured: isAuth0Configured,
        isLoading,
        isAuthenticated,
        user,
        error,
        profile,
      }),
    [error, isAuthenticated, isLoading, profile, user],
  );

  return (
    <SessionActionsContext.Provider value={actions}>
      <SessionContextProvider session={session}>
        {children}
      </SessionContextProvider>
    </SessionActionsContext.Provider>
  );
}
