import { useAuth0 } from "@auth0/auth0-react";
import { Link, useLocation } from "react-router";
import type { AccountView } from "../models/session";
import { logoutReturnTo } from "../auth/auth0";
import {
  showAccountNav,
  showGuestAuthActions,
  showIdentityControl,
} from "../auth/chrome";
import { sanitizeReturnTo } from "../auth/returnTo";
import { useVisitorSession } from "../auth/useVisitorSession";

const protectedPaths = new Set(["/profile", "/orders", "/settings"]);

export default function HeaderAccountControls({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const session = useVisitorSession();

  if (showGuestAuthActions(session)) {
    return <GuestActions variant={variant} onNavigate={onNavigate} />;
  }

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

function loginHref(mode: "sign-in" | "sign-up", pathname: string): string {
  const params = new URLSearchParams({ mode });
  if (protectedPaths.has(pathname)) {
    params.set("returnTo", sanitizeReturnTo(pathname));
  }
  return `/login?${params.toString()}`;
}

function GuestActions({
  variant,
  onNavigate,
}: {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const signIn = loginHref("sign-in", pathname);
  const signUp = loginHref("sign-up", pathname);

  if (variant === "mobile") {
    return (
      <div className="mt-8 flex flex-col gap-3 pt-2">
        <Link
          to={signIn}
          onClick={onNavigate}
          className="border border-[#2a2a2a] px-4 py-3 text-center text-sm font-medium text-[#f0ece3]"
          style={{ borderRadius: "2px" }}
        >
          Sign in
        </Link>
        <Link
          to={signUp}
          onClick={onNavigate}
          className="bg-[#e8820c] px-4 py-3 text-center text-sm font-semibold text-[#080808]"
          style={{ borderRadius: "2px" }}
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        to={signIn}
        className="text-sm font-medium text-[#5a5550] transition-colors hover:text-[#f0ece3]"
      >
        Sign in
      </Link>
      <Link
        to={signUp}
        className="bg-[#e8820c] px-3 py-1.5 text-sm font-semibold text-[#080808] transition-colors hover:bg-[#cf7108]"
        style={{ borderRadius: "2px" }}
      >
        Sign up
      </Link>
    </div>
  );
}

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
        <span className="text-sm font-semibold text-[#f0ece3]">{label}</span>
      )}
    </Link>
  ) : (
    <div className="flex items-center gap-3" aria-label={label}>
      <IdentityMark account={account} initials={initials} />
      {variant === "mobile" && (
        <span className="text-sm font-semibold text-[#f0ece3]">{label}</span>
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
          className="self-start text-sm font-medium text-[#5a5550] transition-colors hover:text-[#f0ece3]"
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
        className="text-sm font-medium text-[#5a5550] transition-colors hover:text-[#f0ece3]"
      >
        Sign out
      </button>
    </div>
  );
}

function IdentityMark({
  account,
  initials,
}: {
  account: AccountView;
  initials: string;
}) {
  return (
    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[#2a2a2a] bg-[#1a1a1a] text-[10px] font-semibold tracking-wide text-[#a09890]">
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
