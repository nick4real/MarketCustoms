import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useLocation, useNavigate } from "react-router";
import type { AccountView } from "../models/session";
import { isAuth0Configured, logoutReturnTo } from "../auth/auth0";
import type { AuthPageMode } from "../auth/authPageMode";
import {
  showAccountNav,
  showGuestAuthActions,
  showIdentityControl,
} from "../auth/chrome";
import { startHostedLogin } from "../auth/hostedLogin";
import { sanitizeReturnTo } from "../auth/returnTo";
import { useVisitorSession } from "../auth/useVisitorSession";

const protectedPaths = new Set(["/profile", "/orders", "/settings"]);

// Parent component router to display the account controls in the header based on the visitor session
export default function HeaderAccountControls({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const session = useVisitorSession();

  // Show guest actions if the visitor is a guest
  if (showGuestAuthActions(session)) {
    return <GuestActions variant={variant} onNavigate={onNavigate} />;
  }

  // Show signed in actions if the visitor is authenticated and has an account
  if (showIdentityControl(session) && session.account) {
    return (
      <SignedInActions
        account={session.account}
        showAccountLinks={showAccountNav(session)}
        variant={variant}
        onNavigate={onNavigate}
      />
    );
  }

  return null;
}

function loginHref(mode: AuthPageMode, pathname: string): string {
  const params = new URLSearchParams({ mode });
  if (protectedPaths.has(pathname)) {
    params.set("returnTo", sanitizeReturnTo(pathname));
  }
  return `/login?${params.toString()}`;
}

function guestReturnTo(pathname: string): string | undefined {
  if (!protectedPaths.has(pathname)) {
    return undefined;
  }
  return sanitizeReturnTo(pathname);
}

// Guest actions depending on the Identity Provider configuration
function GuestActions({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  if (!isAuth0Configured) {
    // Show guest actions if the Identity Provider configuration is missing
    return (
      <UnconfiguredGuestActions variant={variant} onNavigate={onNavigate} />
    );
  }

  // Show guest actions if the Identity Provider is configured with Auth0
  return <Auth0GuestActions variant={variant} onNavigate={onNavigate} />;
}

// Guest actions component router when the Identity Provider is not configured
function UnconfiguredGuestActions({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <GuestAuthButtons
      variant={variant}
      busy={false}
      onSignIn={() => {
        onNavigate?.();
        void navigate(loginHref("sign-in", pathname));
      }}
      onSignUp={() => {
        onNavigate?.();
        void navigate(loginHref("sign-up", pathname));
      }}
    />
  );
}

// Guest actions component router when the Identity Provider is configured with Auth0
function Auth0GuestActions({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const { loginWithRedirect } = useAuth0();
  const { pathname } = useLocation();
  const [starting, setStarting] = useState<AuthPageMode | null>(null);

  async function startAuth(mode: AuthPageMode) {
    if (starting) {
      return;
    }
    setStarting(mode);
    onNavigate?.();
    try {
      await startHostedLogin(loginWithRedirect, mode, guestReturnTo(pathname));
    } catch {
      setStarting(null);
    }
  }

  return (
    <GuestAuthButtons
      variant={variant}
      busy={starting != null}
      onSignIn={() => void startAuth("sign-in")}
      onSignUp={() => void startAuth("sign-up")}
    />
  );
}

//  UI component to display the guest authentication buttons
function GuestAuthButtons({
  variant,
  busy,
  onSignIn,
  onSignUp,
}: {
  variant: "desktop" | "mobile";
  busy: boolean;
  onSignIn: () => void;
  onSignUp: () => void;
}) {
  if (variant === "mobile") {
    return (
      <div className="mt-8 flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={onSignIn}
          disabled={busy}
          className="border-border-subtle text-foreground w-full border px-4 py-3 text-center text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
          style={{ borderRadius: "2px" }}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={onSignUp}
          disabled={busy}
          className="bg-primary text-primary-foreground w-full px-4 py-3 text-center text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          style={{ borderRadius: "2px" }}
        >
          Sign up
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onSignIn}
        disabled={busy}
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sign in
      </button>
      <button
        type="button"
        onClick={onSignUp}
        disabled={busy}
        className="bg-primary text-primary-foreground hover:bg-primary-hover px-3 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{ borderRadius: "2px" }}
      >
        Sign up
      </button>
    </div>
  );
}

// Signed in actions component router
function SignedInActions({
  account,
  showAccountLinks,
  variant,
  onNavigate,
}: {
  account: AccountView;
  showAccountLinks: boolean;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  return (
    <Auth0SignOut
      account={account}
      showAccountLinks={showAccountLinks}
      variant={variant}
      onNavigate={onNavigate}
    />
  );
}

// UI component to display the sign out button when the Identity Provider is configured with Auth0
function Auth0SignOut({
  account,
  showAccountLinks,
  variant,
  onNavigate,
}: {
  account: AccountView;
  showAccountLinks: boolean;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const { logout } = useAuth0();
  const label = account.displayName ?? account.email ?? "Signed in";
  const initials = accountInitials(account);

  function signOut() {
    onNavigate?.();
    void logout({ logoutParams: { returnTo: logoutReturnTo() } });
  }

  const identity = showAccountLinks ? (
    <Link
      to="/profile"
      onClick={onNavigate}
      className="flex items-center gap-3"
      aria-label={label}
    >
      <IdentityMark account={account} initials={initials} />
      {variant === "mobile" && (
        <span className="text-foreground text-sm font-semibold">{label}</span>
      )}
    </Link>
  ) : (
    <div className="flex items-center gap-3" aria-label={label}>
      <IdentityMark account={account} initials={initials} />
      {variant === "mobile" && (
        <span className="text-foreground text-sm font-semibold">{label}</span>
      )}
    </div>
  );

  if (variant === "mobile") {
    return (
      <div className="mt-8 flex flex-col gap-4 pt-2">
        {identity}
        <button
          type="button"
          onClick={signOut}
          className="text-muted-foreground hover:text-foreground self-start text-sm font-medium transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      {identity}
      <button
        type="button"
        onClick={signOut}
        className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}

// UI component to display the identity mark
function IdentityMark({
  account,
  initials,
}: {
  account: AccountView;
  initials: string;
}) {
  return (
    <div className="border-border-subtle bg-secondary text-foreground-muted flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border text-[10px] font-semibold tracking-wide">
      {account.photoUrl ? (
        <img
          src={account.photoUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span style={{ fontFamily: "DM Mono, monospace" }}>{initials}</span>
      )}
    </div>
  );
}

// Function to extract the initials from the account
function accountInitials(account: AccountView): string {
  if (account.displayName) {
    const parts = account.displayName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0]?.[0] ?? "";
      const last = parts[parts.length - 1]?.[0] ?? "";
      return `${first}${last}`.toUpperCase();
    }
    return account.displayName.slice(0, 2).toUpperCase();
  }

  const local = account.email?.split("@")[0];
  if (local) {
    return local.slice(0, 2).toUpperCase();
  }

  return "MC";
}
