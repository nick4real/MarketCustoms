import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ensureCurrentUserMetadata } from "@/entities/profile";
import {
  SessionContextProvider,
  mapAccount,
  toVisitorSession,
  type ProfileLoadState,
} from "@/entities/session";
import { isAuth0Configured } from "@/shared/config";

const idleProfile: ProfileLoadState = { status: "idle" };

export function SessionProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user, error, getAccessTokenSilently } =
    useAuth0();
  const userSub = isAuthenticated ? (user?.sub?.trim() ?? "") : "";
  const [trackedSub, setTrackedSub] = useState("");
  const [profile, setProfile] = useState<ProfileLoadState>(idleProfile);

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
        const token = (await getAccessTokenSilently()) ?? "";
        const metadata = await ensureCurrentUserMetadata(
          token,
          {
            displayName: account.displayName ?? "New member",
            pictureUrl: account.photoUrl,
          },
          controller.signal,
        );
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
  }, [getAccessTokenSilently, user, userSub]);

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
    <SessionContextProvider session={session}>
      {children}
    </SessionContextProvider>
  );
}
