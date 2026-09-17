import { NavLink } from "react-router";
import { HeaderAccountControls } from "@/features/visitor-session";

export default function MobileNav({
  navLinks,
  open,
  onNavigate,
}: {
  navLinks: { to: string; label: string }[];
  open: boolean;
  onNavigate: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="bg-background fixed inset-0 z-40 overflow-y-auto pt-14 md:hidden">
      <div className="flex flex-col px-6 pt-6 pb-10">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `border-border flex items-center justify-between border-b py-4 transition-colors ${
                isActive ? "text-primary" : "text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="text-[28px] font-black tracking-tight"
                  style={{ fontFamily: "Fraunces, Georgia, serif" }}
                >
                  {link.label}
                </span>
                {isActive && (
                  <span
                    className="text-primary text-xs"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    ●
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <HeaderAccountControls variant="mobile" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
