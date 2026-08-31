import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { isAuth0Configured } from "../auth/auth0";
import { destinationAfterSignIn } from "../auth/afterSignIn";
import { mapSessionError } from "../auth/sessionError";
import { useVisitorSession } from "../auth/useVisitorSession";

export default function Callback() {
  if (!isAuth0Configured) {
    return <Navigate to="/login?error=missing_config" replace />;
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

    if (error) {
      const mapped = mapSessionError({ auth0Error: error });
      const code = mapped?.code ?? "callback_failed";
      void navigate(`/login?error=${encodeURIComponent(code)}`, {
        replace: true,
      });
      return;
    }

    if (!hasCallbackParams) {
      const destination =
        session.status === "signed-in"
          ? destinationAfterSignIn("/", session.account)
          : "/login";
      void navigate(destination, { replace: true });
    }
  }, [
    error,
    hasCallbackParams,
    isLoading,
    navigate,
    session.account,
    session.status,
  ]);

  return (
    <div className="w-full max-w-md text-center">
      <p
        className="text-[10px] tracking-[0.2em] text-[#e8820c] uppercase"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        {error ? "Returning you to sign in" : "Signing you in"}
      </p>
      <h1
        className="mt-4 text-[32px] leading-none font-black tracking-tight text-[#f0ece3]"
        style={{ fontFamily: "Fraunces, Georgia, serif" }}
      >
        {error ? "Almost back." : "One moment."}
      </h1>
      <p className="mt-4 text-sm font-light text-[#5a5550]">
        {error
          ? "Sign-in didn't finish. You'll be able to try again."
          : "Finishing your session. You won't stay on this page."}
      </p>
    </div>
  );
}
