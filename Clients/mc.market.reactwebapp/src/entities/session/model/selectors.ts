import type { VisitorSessionView } from "./types";

// Function to determine if the guest authentication actions should be shown
export function showGuestAuthActions(session: VisitorSessionView): boolean {
  return session.status === "guest";
}

// Function to determine if the identity control should be shown
export function showIdentityControl(session: VisitorSessionView): boolean {
  return session.status === "signed-in" && session.account != null;
}

// Function to determine if account navigation (Profile, Settings) should be shown; available to unverified accounts too
export function showAccountNav(session: VisitorSessionView): boolean {
  return session.status === "signed-in" && session.account != null;
}

// Function to determine if the Orders link should be shown; requires a fully usable (verified) account
export function showOrdersNav(session: VisitorSessionView): boolean {
  return (
    session.status === "signed-in" && session.account?.isFullyUsable === true
  );
}
