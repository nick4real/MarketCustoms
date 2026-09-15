import { NavLink } from "react-router";
import { HeaderAccountControls } from "@/features/visitor-session";

export default function SiteHeader({
  navLinks,
  menuOpen,
  onMenuOpenChange,
}: {
  navLinks: { to: string; label: string }[];
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}) {
  const closeMenu = () => onMenuOpenChange(false);

  return (
    <nav className="border-border bg-background/95 fixed top-0 right-0 left-0 z-50 flex h-14 items-center border-b px-5 backdrop-blur-sm md:px-10">
      <NavLink
        to="/"
        className="flex flex-1 items-center md:mr-14 md:flex-none"
        onClick={closeMenu}
      >
        <span
          className="text-foreground text-[22px] leading-none font-black tracking-tighter"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          MKT<span className="text-primary">.</span>
        </span>
      </NavLink>

      <div className="hidden flex-1 items-center gap-8 md:flex">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `text-sm font-medium tracking-wide transition-colors duration-150 ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground-muted"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground hidden transition-colors md:block"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        <button
          type="button"
          className="text-muted-foreground hover:text-foreground relative transition-colors"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span
            className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            3
          </span>
        </button>

        <HeaderAccountControls />

        <button
          type="button"
          className="text-muted-foreground hover:text-foreground p-1 transition-colors md:hidden"
          onClick={() => onMenuOpenChange(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
