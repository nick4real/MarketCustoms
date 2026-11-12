import { showAccountNav, type VisitorSessionView } from "@/entities/session";
import { routes } from "@/shared/config";

export interface NavItem {
  to: string;
  label: string;
}

export function getNavLinks(session: VisitorSessionView): NavItem[] {
  const browse: NavItem = { to: routes.browse, label: "Browse" };
  if (!showAccountNav(session)) {
    return [browse];
  }
  return [
    browse,
    { to: routes.orders, label: "Orders" },
    { to: routes.profile, label: "Profile" },
    { to: routes.settings, label: "Settings" },
  ];
}
