import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { mapSessionError, useVisitorSession } from "@/entities/session";
import { Button, Tabs } from "@/shared/ui";
import {
  emailVerificationPath,
  isPublicStorefrontPath,
  parseAuthPageMode,
  sanitizeReturnTo,
  startHostedLogin,
  type AuthPageMode,
} from "@/features/auth";
import { isAuth0Configured, routes } from "@/shared/config";

const MODE_TABS = [
  { id: "sign-in", label: "Sign in" },
  { id: "sign-up", label: "Sign up" },
] as const;

function modeCopy(mode: AuthPageMode): {
  title: string;
  body: string;
  action: string;
  actionBusy: string;
} {
  if (mode === "sign-up") {
    return {
      title: "Create an account",
      body: "Continue to Auth0 to choose an email and password. MarketCustoms never asks for your password here.",
      action: "Create account",
      actionBusy: "Creating account…",
    };
  }
  return {
    title: "Sign in",
    body: "Continue to Auth0 to enter your credentials. MarketCustoms never asks for your password here.",
    action: "Continue",
    actionBusy: "Continuing…",
  };
}

export function LoginPage() {
  if (!isAuth0Configured) {
    return <LoginPanel configured={false} />;
  }
  return <Auth0LoginPanel />;
}

// Configure the login panel when the Identity Provider is configured with Auth0
function Auth0LoginPanel() {
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
        <p className="text-primary font-mono text-[10px] tracking-[0.2em] uppercase">
          Session
        </p>
        <h1 className="text-foreground font-display mt-4 text-[32px] leading-none font-black tracking-tight">
          Checking your account.
        </h1>
      </div>
    );
  }

  if (session.status === "signed-in") {
    if (session.account && !session.account.isFullyUsable) {
      return <Navigate to={emailVerificationPath} replace />;
    }
    const sanitized = sanitizeReturnTo(returnTo);
    const destination = isPublicStorefrontPath(sanitized)
      ? sanitized
      : routes.home;
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

// UI component to display the login panel
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
  const missingConfigMessage = mapSessionError({
    missingConfig: true,
  })?.message;
  const message = configured ? errorMessage : missingConfigMessage;

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3">
        <span className="bg-primary h-px w-6 shrink-0" />
        <span className="text-primary font-mono text-[10px] tracking-[0.2em] uppercase">
          Account
        </span>
      </div>

      <Tabs
        items={MODE_TABS}
        value={mode}
        onChange={(next) => onModeChange?.(next)}
        disabled={!configured || busy}
        className="mb-8"
      />

      <h1 className="text-foreground font-display mb-4 text-[36px] leading-[0.95] font-black tracking-tight md:text-[44px]">
        {copy.title}
      </h1>
      <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed font-light">
        {copy.body}
      </p>

      {message && (
        <div
          className="border-border-subtle bg-card text-foreground mb-6 rounded-xs border px-4 py-3 text-sm font-light"
          role="alert"
        >
          {message}
        </div>
      )}

      <Button
        size="lg"
        onClick={onContinue}
        disabled={!configured || busy || !onContinue}
        className="w-full"
      >
        {busy ? copy.actionBusy : copy.action}
      </Button>

      {mode === "sign-in" && (
        <p className="text-muted-foreground mt-5 text-sm font-light">
          Forgot your password?{" "}
          <button
            type="button"
            onClick={onRecoverPassword}
            disabled={!configured || busy || !onRecoverPassword}
            className="text-foreground decoration-border-subtle hover:decoration-primary underline underline-offset-4 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to reset it
          </button>{" "}
          on Auth0 — we never collect a new password here.
        </p>
      )}

      <p className="text-muted-foreground mt-8 text-sm font-light">
        Prefer to keep browsing?{" "}
        <Link
          to={routes.home}
          className="text-foreground decoration-border-subtle hover:decoration-primary underline underline-offset-4 transition-colors"
        >
          Return to the market
        </Link>
      </p>
    </div>
  );
}
