import { Navigate, Outlet, useLocation } from "react-router";
import { useVisitorSession } from "@/entities/session";
import { sanitizeReturnTo } from "@/features/auth";
import { VerifyEmailPage } from "@/pages/verify-email";
import { routes } from "@/shared/config";
import { StatusMessage } from "@/shared/ui";

export function AccountGate() {
  const session = useVisitorSession();
  const location = useLocation();

  if (session.status === "authenticating") {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
        <StatusMessage size="inline" message="Loading your account…" />
      </div>
    );
  }

  if (session.status === "guest") {
    const returnTo = sanitizeReturnTo(location.pathname);
    const params = new URLSearchParams({
      mode: "sign-in",
      returnTo,
    });
    return <Navigate to={`${routes.login}?${params.toString()}`} replace />;
  }

  if (session.account && !session.account.isFullyUsable) {
    return <VerifyEmailPage />;
  }

  return <Outlet />;
}
