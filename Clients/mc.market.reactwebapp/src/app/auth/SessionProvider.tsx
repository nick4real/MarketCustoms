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
  // One forced refresh per signed-in user: if the claim still does not arrive, retrying cannot help.
  const mismatchRefreshAttemptedFor = useRef("");
  const account = mapAccount(user);
  const signUpDisplayName = account?.displayName ?? "New member";
  const signUpPictureUrl = account?.photoUrl ?? null;

  if (userSub !== trackedSub) {
    setTrackedSub(userSub);
    setProfile(userSub ? { status: "loading" } : idleProfile);
  }

  useEffect(() => {
    if (!userSub) {
      return;
    }

    const controller = new AbortController();

    void (async () => {
      try {
        const force = forceFreshToken.current;
        const token =
          (await (force
            ? getAccessTokenSilently({ cacheMode: "off" })
            : getAccessTokenSilently())) ?? "";
        if (force) {
          forceFreshToken.current = false;
        }
        const metadata = await ensureCurrentUserMetadata(
          token,
          { displayName: signUpDisplayName, pictureUrl: signUpPictureUrl },
          controller.signal,
        );
        if (controller.signal.aborted) {
          return;
        }
        // Profiles writes the profile id to Auth0 on first call; a fresh token carries it.
        if (
          readJwtClaim(token, PROFILE_ID_CLAIM) !== metadata.id &&
          mismatchRefreshAttemptedFor.current !== userSub
        ) {
          mismatchRefreshAttemptedFor.current = userSub;
          try {
            await getAccessTokenSilently({ cacheMode: "off" });
          } catch {
            // The metadata is already loaded; a stale token only delays seller access.
          }
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
  }, [
    getAccessTokenSilently,
    reloadCount,
    signUpDisplayName,
    signUpPictureUrl,
    userSub,
  ]);

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
