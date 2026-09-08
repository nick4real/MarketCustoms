import { Navigate, Outlet, useLocation } from "react-router";
import EmailVerificationNotice from "./EmailVerificationNotice";
import { sanitizeReturnTo } from "@/features/auth/lib/returnTo";
import { useVisitorSession } from "@/features/auth/lib/useVisitorSession";

export function AccountGate() {
  const session = useVisitorSession();
  const location = useLocation();

  if (session.status === "authenticating") {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
        <p className="text-muted-foreground text-sm font-light">
          Loading your account…
        </p>
      </div>
    );
  }

  if (session.status === "guest") {
    const returnTo = sanitizeReturnTo(location.pathname);
    const params = new URLSearchParams({
      mode: "sign-in",
      returnTo,
    });
    return <Navigate to={`/login?${params.toString()}`} replace />;
  }

  if (session.account && !session.account.isFullyUsable) {
    return <EmailVerificationNotice />;
  }

  return <Outlet />;
}

export default AccountGate;
