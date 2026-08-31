import { useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { isAuth0Configured } from "../auth/auth0";
import { mapSessionError } from "../auth/sessionError";

export default function Callback() {
  if (!isAuth0Configured) {
    return <Navigate to="/login?error=missing_config" replace />;
  }
  return <CallbackHandler />;
}

function CallbackHandler() {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasCallbackParams =
    searchParams.has("code") ||
    searchParams.has("state") ||
    searchParams.has("error");

  useEffect(() => {
    if (isLoading) {
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
      void navigate(isAuthenticated ? "/" : "/login", { replace: true });
    }
  }, [error, hasCallbackParams, isAuthenticated, isLoading, navigate]);

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
