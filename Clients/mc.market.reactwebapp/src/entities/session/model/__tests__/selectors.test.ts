import { describe, expect, it } from "vitest";
import {
  showAccountNav,
  showGuestAuthActions,
  showIdentityControl,
  showOrdersNav,
} from "../selectors";
import type { AccountView, VisitorSessionView } from "../types";

const usableAccount: AccountView = {
  subject: "auth0|1",
  displayName: "Ada",
  email: "ada@example.com",
  photoUrl: null,
  emailVerified: true,
  isFullyUsable: true,
  profileId: "11111111-1111-1111-1111-111111111111",
  accountType: "Basic",
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
    expect(showOrdersNav(guest)).toBe(false);
  });

  it("hides guest and account chrome while authenticating", () => {
    const authenticating = session({ status: "authenticating" });
    expect(showGuestAuthActions(authenticating)).toBe(false);
    expect(showIdentityControl(authenticating)).toBe(false);
    expect(showAccountNav(authenticating)).toBe(false);
    expect(showOrdersNav(authenticating)).toBe(false);
  });

  it("shows account nav but not orders nav when not fully usable", () => {
    const unverified = session({
      status: "signed-in",
      account: unverifiedAccount,
    });
    expect(showGuestAuthActions(unverified)).toBe(false);
    expect(showIdentityControl(unverified)).toBe(true);
    expect(showAccountNav(unverified)).toBe(true);
    expect(showOrdersNav(unverified)).toBe(false);
  });

  it("shows identity, account nav and orders nav when fully usable", () => {
    const signedIn = session({
      status: "signed-in",
      account: usableAccount,
    });
    expect(showGuestAuthActions(signedIn)).toBe(false);
    expect(showIdentityControl(signedIn)).toBe(true);
    expect(showAccountNav(signedIn)).toBe(true);
    expect(showOrdersNav(signedIn)).toBe(true);
  });

  it("hides account and orders nav when signed in without an account", () => {
    const noAccount = session({ status: "signed-in", account: null });
    expect(showAccountNav(noAccount)).toBe(false);
    expect(showOrdersNav(noAccount)).toBe(false);
  });
});
