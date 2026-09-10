import {
  createElement,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ensureCurrentUserMetadata } from "@/features/auth/api/profiles";
import type { VisitorSessionView } from "@/features/auth/types/session";
import { isAuth0Configured } from "./auth0";
import { displayNameForProfileEnsure, mapAccount } from "./mapAccount";
import { VisitorSessionContext } from "./visitorSessionContext";
import {
  type ProfileLoadState,
  toVisitorSession,
} from "./visitorSessionView";

export function ProvideVisitorSession({
  session,
  children,
}: {
  session: VisitorSessionView;
  children: ReactNode;
}) {
  return createElement(
    VisitorSessionContext.Provider,
    { value: session },
    children,
  );
}

const idleProfile: ProfileLoadState = { status: "idle" };

export function Auth0VisitorSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
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
        const token = await getAccessTokenSilently();
        const metadata = await ensureCurrentUserMetadata(
          token,
          {
            displayName: displayNameForProfileEnsure(account),
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

  return createElement(ProvideVisitorSession, { session, children });
}
