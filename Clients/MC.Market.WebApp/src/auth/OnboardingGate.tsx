import { useAuth0 } from "@auth0/auth0-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { getMyProfile } from "../api/profiles";
import LoadingSpinner from "../components/LoadingSpinner";
import ProfilesUnavailable from "../pages/ProfilesUnavailable";

type OnboardingStatus = {
  isVerified: boolean;
  isSeller: boolean;
  reload: () => void;
  markVerified: (isSeller?: boolean) => void;
};

const OnboardingContext = createContext<OnboardingStatus | null>(null);

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [isVerified, setIsVerified] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const reload = useCallback(() => {
    setRetryToken((value) => value + 1);
  }, []);

  const markVerified = useCallback((nextIsSeller = false) => {
    setIsVerified(true);
    setIsSeller(nextIsSeller);
    setStatus("ready");
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setIsVerified(false);
      setIsSeller(false);
      setStatus("ready");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    getAccessTokenSilently()
      .then((token) => getMyProfile(token))
      .then((profile) => {
        if (cancelled) {
          return;
        }
        setIsVerified(profile.isVerified);
        setIsSeller(profile.isSeller);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setIsVerified(false);
          setIsSeller(false);
          setStatus("unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, getAccessTokenSilently, retryToken]);

  const value = useMemo<OnboardingStatus>(
    () => ({ isVerified, isSeller, reload, markVerified }),
    [isVerified, isSeller, reload, markVerified],
  );

  return (
    <OnboardingContext.Provider value={value}>
      <OnboardingStateContext.Provider
        value={{
          authLoading,
          isAuthenticated,
          status,
          isVerified,
          reload,
        }}
      >
        {children}
      </OnboardingStateContext.Provider>
    </OnboardingContext.Provider>
  );
}

type GateState = {
  authLoading: boolean;
  isAuthenticated: boolean;
  status: "idle" | "loading" | "ready" | "unavailable";
  isVerified: boolean;
  reload: () => void;
};

const OnboardingStateContext = createContext<GateState | null>(null);

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const gate = useContext(OnboardingStateContext);

  if (!gate) {
    return children;
  }

  if (gate.authLoading || (gate.isAuthenticated && (gate.status === "loading" || gate.status === "idle"))) {
    return <LoadingSpinner label="Loading profile..." />;
  }

  if (gate.isAuthenticated && gate.status === "unavailable") {
    return <ProfilesUnavailable onRetry={gate.reload} />;
  }

  const isClarify = location.pathname === "/profile/clarify";

  if (gate.isAuthenticated && !gate.isVerified) {
    if (!isClarify) {
      return <Navigate to="/profile/clarify" replace />;
    }
    return children;
  }

  if (gate.isAuthenticated && gate.isVerified && isClarify) {
    return <Navigate to="/" replace />;
  }

  return children;
}

