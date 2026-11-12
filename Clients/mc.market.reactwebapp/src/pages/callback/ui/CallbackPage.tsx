import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { mapSessionError, useVisitorSession } from "@/entities/session";
import {
  destinationAfterSignIn,
  takePostSignInReturnTo,
} from "@/features/auth";
import { isAuth0Configured, routes } from "@/shared/config";

export function CallbackPage() {
  if (!isAuth0Configured) {
    return <Navigate to={`${routes.login}?error=missing_config`} replace />;
  }
  return <CallbackHandler />;
}

function CallbackHandler() {
  const { isLoading, error } = useAuth0();
  const session = useVisitorSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasCallbackParams =
    searchParams.has("code") ||
    searchParams.has("state") ||
    searchParams.has("error");

  useEffect(() => {
    if (isLoading || session.status === "authenticating") {
      return;
    }

    if (error || session.error) {
      const mapped = mapSessionError({ auth0Error: error }) ?? session.error;
      const code = mapped?.code ?? "callback_failed";
      void navigate(`/login?error=${encodeURIComponent(code)}`, {
        replace: true,
      });
      return;
    }

    if (!hasCallbackParams) {
      const destination =
        session.status === "signed-in"
          ? destinationAfterSignIn(takePostSignInReturnTo(), session.account)
          : routes.login;
      void navigate(destination, { replace: true });
    }
  }, [
    error,
    hasCallbackParams,
    isLoading,
    navigate,
    session.account,
    session.error,
    session.status,
  ]);

  return (
    <div className="w-full max-w-md text-center">
      <p className="text-primary font-mono text-[10px] tracking-[0.2em] uppercase">
        {error || session.error ? "Returning you to sign in" : "Signing you in"}
      </p>
      <h1 className="text-foreground font-display mt-4 text-[32px] leading-none font-black tracking-tight">
        {error || session.error ? "Almost back." : "One moment."}
      </h1>
      <p className="text-muted-foreground mt-4 text-sm font-light">
        {error || session.error
          ? "Sign-in didn't finish. You'll be able to try again."
          : "Finishing your session. You won't stay on this page."}
      </p>
    </div>
  );
}
