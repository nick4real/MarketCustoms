import { Outlet } from "react-router";
import { useVisitorSession } from "@/entities/session";
import { VerifyEmailPage } from "@/pages/verify-email";

export function VerifiedGate() {
  const session = useVisitorSession();

  if (session.account && !session.account.isFullyUsable) {
    return <VerifyEmailPage />;
  }

  return <Outlet />;
}
