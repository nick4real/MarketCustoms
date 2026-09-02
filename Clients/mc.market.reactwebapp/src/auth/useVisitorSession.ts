import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import type { VisitorSessionView } from "../models/session";
import { isAuth0Configured } from "./auth0";
import { mapAccount, type Auth0UserLike } from "./mapAccount";
import { mapSessionError } from "./sessionError";

// Fallback Session for when the Identity Provider (Auth0) configuration is missing
export const missingConfigSession: VisitorSessionView = {
  status: "guest",
  account: null,
  error: mapSessionError({ missingConfig: true }),
};

// Function to convert the Auth0 status to the application's custom Visitor Session
export function toVisitorSession(input: {
  isConfigured: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: Auth0UserLike | undefined;
  error: unknown;
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
    return { status: "signed-in", account, error: null };
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

// Provider for the Auth0 Visitor Session
export function Auth0VisitorSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { isLoading, isAuthenticated, user, error } = useAuth0();
  const session = useMemo(
    () =>
      toVisitorSession({
        isConfigured: isAuth0Configured,
        isLoading,
        isAuthenticated,
        user,
        error,
      }),
    [isLoading, isAuthenticated, user, error],
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
