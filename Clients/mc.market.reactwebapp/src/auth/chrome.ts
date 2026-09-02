import type { VisitorSessionView } from "../models/session";

// Function to determine if the guest authentication actions should be shown
export function showGuestAuthActions(session: VisitorSessionView): boolean {
  return session.status === "guest";
}

// Function to determine if the identity control should be shown
export function showIdentityControl(session: VisitorSessionView): boolean {
  return session.status === "signed-in" && session.account != null;
}

// Function to determine if the account is activated and navigation links should be shown
export function showAccountNav(session: VisitorSessionView): boolean {
  return (
    session.status === "signed-in" && session.account?.isFullyUsable === true
  );
}
