import type { VisitorSessionView } from "../models/session";

export function showGuestAuthActions(session: VisitorSessionView): boolean {
  return session.status === "guest";
}

export function showIdentityControl(session: VisitorSessionView): boolean {
  return session.status === "signed-in" && session.account != null;
}

export function showAccountNav(session: VisitorSessionView): boolean {
  return (
    session.status === "signed-in" && session.account?.isFullyUsable === true
  );
}
