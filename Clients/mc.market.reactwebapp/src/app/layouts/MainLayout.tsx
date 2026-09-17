import { useState } from "react";
import { Outlet } from "react-router";
import { showAccountNav } from "@/entities/session";
import { useVisitorSession } from "@/features/visitor-session";
import { MobileNav } from "@/widgets/mobile-nav";
import { SiteHeader } from "@/widgets/header";

const browseLink = { to: "/browse", label: "Browse" };
const accountLinks = [
  { to: "/orders", label: "Orders" },
  { to: "/profile", label: "Profile" },
  { to: "/settings", label: "Settings" },
];

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const session = useVisitorSession();
  const navLinks = showAccountNav(session)
    ? [browseLink, ...accountLinks]
    : [browseLink];

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader
        navLinks={navLinks}
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
      />
      <MobileNav
        navLinks={navLinks}
        open={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />
      <div className="pt-14">
        <Outlet />
      </div>
    </div>
  );
}
