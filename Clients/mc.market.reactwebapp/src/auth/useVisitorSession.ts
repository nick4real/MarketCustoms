import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ensureCurrentUserMetadata } from "../api/profiles";
import type { CurrentUserMetadata } from "../models/profile";
import type { VisitorSessionView } from "../models/session";
import { isAuth0Configured } from "./auth0";
import {
  applyProfileMetadata,
  displayNameForProfileEnsure,
  mapAccount,
  type Auth0UserLike,
} from "./mapAccount";
import { mapSessionError } from "./sessionError";

export type ProfileLoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; metadata: CurrentUserMetadata }
  | { status: "error" };

// Fallback Session for when the Identity Provider (Auth0) configuration is missing
export const missingConfigSession: VisitorSessionView = {
  status: "guest",
  account: null,
  error: mapSessionError({ missingConfig: true }),
};

function profileStateForSession(
  isAuthenticated: boolean,
  profile: ProfileLoadState | undefined,
): ProfileLoadState {
  if (profile) {
    return profile;
  }
  return isAuthenticated ? { status: "loading" } : { status: "idle" };
}

// Function to convert the Auth0 status to the application's custom Visitor Session
export function toVisitorSession(input: {
  isConfigured: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: Auth0UserLike | undefined;
  error: unknown;
  profile?: ProfileLoadState;
}): VisitorSessionView {
  if (!input.isConfigured) {
    return missingConfigSession;
  }

  if (input.error) {
    return {
      status: "guest",
      account: null,
      error: mapSessionError({ auth0Error: input.error }),
    };
  }

  if (input.isLoading) {
    return { status: "authenticating", account: null, error: null };
  }

  if (input.isAuthenticated) {
    const account = mapAccount(input.user);
    if (!account) {
      return {
        status: "guest",
        account: null,
        error: mapSessionError({ callbackFailed: true }),
      };
    }

    const profile = profileStateForSession(
      input.isAuthenticated,
      input.profile,
    );
    if (profile.status === "idle" || profile.status === "loading") {
      return { status: "authenticating", account: null, error: null };
    }
    if (profile.status === "error") {
      return {
        status: "guest",
        account: null,
        error: mapSessionError({ profileFailed: true }),
      };
    }

    return {
      status: "signed-in",
      account: applyProfileMetadata(account, profile.metadata),
      error: null,
    };
  }

  return { status: "guest", account: null, error: null };
}

const VisitorSessionContext = createContext<VisitorSessionView | null>(null);

// Boilerplate function to provide the Visitor Session
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

// Provider for the Auth0 Visitor Session
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

// Hook to extract the visitor session
export function useVisitorSession(): VisitorSessionView {
  const session = useContext(VisitorSessionContext);
  if (!session) {
    throw new Error("useVisitorSession must be used within a session provider");
  }
  return session;
}
