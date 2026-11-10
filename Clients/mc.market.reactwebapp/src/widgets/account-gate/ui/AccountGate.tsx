import { Navigate, Outlet, useLocation } from "react-router";
import { StatusMessage } from "@/shared";
import EmailVerificationNotice from "./EmailVerificationNotice";
import {
  sanitizeReturnTo,
  useVisitorSession,
} from "@/features/visitor-session";

export default function AccountGate() {
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
    return <Navigate to={`/login?${params.toString()}`} replace />;
  }

  if (session.account && !session.account.isFullyUsable) {
    return <EmailVerificationNotice />;
  }

  return <Outlet />;
}
