import { NavLink } from "react-router";
import { AccountControls } from "@/features/auth";
import { cx } from "@/shared/lib";
import type { NavItem } from "../model/navLinks";

export function MobileNav({
  navLinks,
  open,
  onNavigate,
}: {
  navLinks: NavItem[];
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
              cx(
                "border-border flex items-center justify-between border-b py-4 transition-colors",
                isActive ? "text-primary" : "text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="font-display text-[28px] font-black tracking-tight">
                  {link.label}
                </span>
                {isActive && (
                  <span className="text-primary font-mono text-xs">●</span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <AccountControls variant="mobile" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
