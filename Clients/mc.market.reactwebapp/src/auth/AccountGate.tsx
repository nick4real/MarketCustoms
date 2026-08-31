import { Navigate, Outlet, useLocation } from "react-router";
import EmailVerificationNotice from "../components/EmailVerificationNotice";
import { sanitizeReturnTo } from "./returnTo";
import { useVisitorSession } from "./useVisitorSession";

export default function AccountGate() {
  const session = useVisitorSession();
  const location = useLocation();

  if (session.status === "authenticating") {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6">
        <p className="text-sm font-light text-[#5a5550]">Loading your account…</p>
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
