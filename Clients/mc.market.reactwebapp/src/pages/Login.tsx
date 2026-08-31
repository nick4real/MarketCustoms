import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { isAuth0Configured } from "../auth/auth0";
import { parseAuthPageMode, type AuthPageMode } from "../auth/authPageMode";
import { startHostedLogin } from "../auth/hostedLogin";
import { isPublicStorefrontPath, sanitizeReturnTo } from "../auth/returnTo";
import { mapSessionError } from "../auth/sessionError";
import { useVisitorSession } from "../auth/useVisitorSession";

function modeCopy(mode: AuthPageMode): { title: string; body: string; action: string } {
  if (mode === "sign-up") {
    return {
      title: "Create an account",
      body: "Continue to Auth0 to choose an email and password. MarketCustoms never asks for your password here.",
      action: "Create account",
    };
  }
  return {
    title: "Sign in",
    body: "Continue to Auth0 to enter your credentials. MarketCustoms never asks for your password here.",
    action: "Continue",
  };
}

export default function Login() {
  if (!isAuth0Configured) {
    return <LoginPanel configured={false} />;
  }
  return <ConfiguredLogin />;
}

function ConfiguredLogin() {
  const { loginWithRedirect } = useAuth0();
  const session = useVisitorSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const [starting, setStarting] = useState(false);

  const mode = parseAuthPageMode(searchParams.get("mode"));
  const returnTo = searchParams.get("returnTo");
  const queryError = mapSessionError({ queryCode: searchParams.get("error") });
  const error = queryError ?? session.error;

  if (session.status === "authenticating") {
    return (
      <div className="w-full max-w-md">
        <p
          className="text-[10px] tracking-[0.2em] text-[#e8820c] uppercase"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Session
        </p>
        <h1
          className="mt-4 text-[32px] leading-none font-black tracking-tight text-[#f0ece3]"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Checking your account.
        </h1>
      </div>
    );
  }

  if (session.status === "signed-in") {
    const sanitized = sanitizeReturnTo(returnTo);
    const destination = isPublicStorefrontPath(sanitized) ? sanitized : "/";
    return <Navigate to={destination} replace />;
  }

  function setMode(next: AuthPageMode) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("mode", next);
    nextParams.delete("error");
    setSearchParams(nextParams, { replace: true });
  }

  async function continueToHostedLogin() {
    setStarting(true);
    try {
      await startHostedLogin(loginWithRedirect, mode, returnTo);
    } catch {
      setStarting(false);
    }
  }

  return (
    <LoginPanel
      configured
      mode={mode}
      errorMessage={error?.message ?? null}
      busy={starting}
      onModeChange={setMode}
      onContinue={() => void continueToHostedLogin()}
      onRecoverPassword={() => void continueToHostedLogin()}
    />
  );
}

function LoginPanel({
  configured,
  mode = "sign-in",
  errorMessage = null,
  busy = false,
  onModeChange,
  onContinue,
  onRecoverPassword,
}: {
  configured: boolean;
  mode?: AuthPageMode;
  errorMessage?: string | null;
  busy?: boolean;
  onModeChange?: (mode: AuthPageMode) => void;
  onContinue?: () => void;
  onRecoverPassword?: () => void;
}) {
  const copy = modeCopy(mode);
  const missingConfigMessage = mapSessionError({ missingConfig: true })?.message;
  const message = configured ? errorMessage : missingConfigMessage;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3">
        <span className="h-px w-6 shrink-0 bg-[#e8820c]" />
        <span
          className="text-[10px] tracking-[0.2em] text-[#e8820c] uppercase"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Account
        </span>
      </div>

      <div className="mb-8 flex gap-6 border-b border-[#1e1e1e]">
        {(
          [
            { id: "sign-in", label: "Sign in" },
            { id: "sign-up", label: "Sign up" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onModeChange?.(tab.id)}
            disabled={!configured || busy}
            className={`border-b-2 pb-3 text-xs tracking-[0.15em] uppercase transition-colors ${
              mode === tab.id
                ? "border-[#e8820c] text-[#f0ece3]"
                : "border-transparent text-[#5a5550] hover:text-[#a09890]"
            }`}
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <h1
        className="mb-4 text-[36px] leading-[0.95] font-black tracking-tight text-[#f0ece3] md:text-[44px]"
        style={{ fontFamily: "Fraunces, Georgia, serif" }}
      >
        {copy.title}
      </h1>
      <p className="mb-8 text-[15px] leading-relaxed font-light text-[#5a5550]">
        {copy.body}
      </p>

      {message && (
        <div
          className="mb-6 border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm font-light text-[#f0ece3]"
          style={{ borderRadius: "2px" }}
          role="alert"
        >
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={!configured || busy || !onContinue}
        className="w-full bg-[#e8820c] px-6 py-3 text-sm font-semibold tracking-wide text-[#080808] transition-colors hover:bg-[#cf7108] disabled:cursor-not-allowed disabled:opacity-40"
        style={{ borderRadius: "2px" }}
      >
        {busy ? "Continuing…" : copy.action}
      </button>

      {mode === "sign-in" && (
        <p className="mt-5 text-sm font-light text-[#5a5550]">
          Forgot your password?{" "}
          <button
            type="button"
            onClick={onRecoverPassword}
            disabled={!configured || busy || !onRecoverPassword}
            className="text-[#f0ece3] underline decoration-[#2a2a2a] underline-offset-4 transition-colors hover:decoration-[#e8820c] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to reset it
          </button>{" "}
          on Auth0 — we never collect a new password here.
        </p>
      )}

      <p className="mt-8 text-sm font-light text-[#5a5550]">
        Prefer to keep browsing?{" "}
        <Link
          to="/"
          className="text-[#f0ece3] underline decoration-[#2a2a2a] underline-offset-4 transition-colors hover:decoration-[#e8820c]"
        >
          Return to the market
        </Link>
      </p>
    </div>
  );
}
