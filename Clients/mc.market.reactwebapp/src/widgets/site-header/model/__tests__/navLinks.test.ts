import { describe, expect, it } from "vitest";
import type { VisitorSessionView } from "@/entities/session";
import { routes } from "@/shared/config";
import { getNavLinks } from "../navLinks";

const account = {
  subject: "auth0|1",
  displayName: "Ada",
  email: "ada@example.com",
  photoUrl: null,
  emailVerified: true,
  isFullyUsable: true,
  profileId: "11111111-1111-1111-1111-111111111111",
  accountType: "Basic",
};

function session(
  status: VisitorSessionView["status"],
  isFullyUsable = true,
): VisitorSessionView {
  return {
    status,
    account: status === "guest" ? null : { ...account, isFullyUsable },
    error: null,
  };
}

const paths = (s: VisitorSessionView) => getNavLinks(s).map((link) => link.to);

describe("getNavLinks", () => {
  it("shows only Browse to guests", () => {
    expect(paths(session("guest"))).toEqual([routes.browse]);
  });

  it("shows only Browse while the account is not fully usable", () => {
    expect(paths(session("signed-in", false))).toEqual([routes.browse]);
  });

  it("adds account pages for a fully usable signed-in account", () => {
    expect(paths(session("signed-in"))).toEqual([
      routes.browse,
      routes.orders,
      routes.profile,
      routes.settings,
    ]);
  });
});
