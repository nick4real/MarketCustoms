import { describe, expect, it } from "vitest";
import {
  showAccountNav,
  showGuestAuthActions,
  showIdentityControl,
} from "./chrome";
import type { AccountView, VisitorSessionView } from "../models/session";

const usableAccount: AccountView = {
  subject: "auth0|1",
  displayName: "Ada",
  email: "ada@example.com",
  photoUrl: null,
  emailVerified: true,
  isFullyUsable: true,
};

const unverifiedAccount: AccountView = {
  ...usableAccount,
  emailVerified: false,
  isFullyUsable: false,
};

function session(
  partial: Partial<VisitorSessionView> & Pick<VisitorSessionView, "status">,
): VisitorSessionView {
  return {
    account: null,
    error: null,
    ...partial,
  };
}

describe("header chrome predicates", () => {
  it("shows Sign in / Sign up only for guests", () => {
    const guest = session({ status: "guest" });
    expect(showGuestAuthActions(guest)).toBe(true);
    expect(showIdentityControl(guest)).toBe(false);
    expect(showAccountNav(guest)).toBe(false);
  });

  it("hides guest and account chrome while authenticating", () => {
    const authenticating = session({ status: "authenticating" });
    expect(showGuestAuthActions(authenticating)).toBe(false);
    expect(showIdentityControl(authenticating)).toBe(false);
    expect(showAccountNav(authenticating)).toBe(false);
  });

  it("shows identity without account nav when not fully usable", () => {
    const unverified = session({
      status: "signed-in",
      account: unverifiedAccount,
    });
    expect(showGuestAuthActions(unverified)).toBe(false);
    expect(showIdentityControl(unverified)).toBe(true);
    expect(showAccountNav(unverified)).toBe(false);
  });

  it("shows identity and account nav when fully usable", () => {
    const signedIn = session({
      status: "signed-in",
      account: usableAccount,
    });
    expect(showGuestAuthActions(signedIn)).toBe(false);
    expect(showIdentityControl(signedIn)).toBe(true);
    expect(showAccountNav(signedIn)).toBe(true);
  });
});
