import { useState } from "react";
import { NavLink, Outlet } from "react-router";

const navLinks = [
  { to: "/browse", label: "Browse" },
  { to: "/orders", label: "Orders" },
  { to: "/profile", label: "Profile" },
  { to: "/settings", label: "Settings" },
];

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080808]">
      <nav className="fixed top-0 right-0 left-0 z-50 flex h-14 items-center border-b border-[#1e1e1e] bg-[#080808]/95 px-5 backdrop-blur-sm md:px-10">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex flex-1 items-center md:mr-14 md:flex-none"
          onClick={() => setMenuOpen(false)}
        >
          <span
            className="text-[22px] leading-none font-black tracking-tighter text-[#f0ece3]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            MKT<span className="text-[#e8820c]">.</span>
          </span>
        </NavLink>

        {/* Desktop nav links */}
        <div className="hidden flex-1 items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-colors duration-150 ${
                  isActive
                    ? "text-[#f0ece3]"
                    : "text-[#5a5550] hover:text-[#a09890]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <button className="hidden text-[#5a5550] transition-colors hover:text-[#f0ece3] md:block">
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

          <button className="relative text-[#5a5550] transition-colors hover:text-[#f0ece3]">
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
              className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8820c] text-[9px] font-bold text-[#080808]"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              3
            </span>
          </button>

          {/* Avatar — desktop only */}
          <NavLink to="/profile" className="hidden md:block">
            <div className="h-7 w-7 overflow-hidden rounded-full border border-[#2a2a2a] transition-colors hover:border-[#e8820c]">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format"
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
          </NavLink>

          {/* Hamburger — mobile only */}
          <button
            className="p-1 text-[#5a5550] transition-colors hover:text-[#f0ece3] md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
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

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-[#080808] pt-14 md:hidden">
          <div className="flex flex-col px-6 pt-6 pb-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between border-b border-[#1e1e1e] py-4 transition-colors ${
                    isActive ? "text-[#e8820c]" : "text-[#f0ece3]"
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
                        className="text-xs text-[#e8820c]"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        ●
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

            <NavLink
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="mt-8 flex items-center gap-4 pt-2"
            >
              <div className="h-11 w-11 overflow-hidden rounded-full border border-[#2a2a2a]">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=88&h=88&fit=crop&auto=format"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#f0ece3]">
                  Jordan Nakamura
                </div>
                <div
                  className="text-xs text-[#5a5550]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  @j.nakamura
                </div>
              </div>
            </NavLink>
          </div>
        </div>
      )}

      <div className="pt-14">
        <Outlet />
      </div>
    </div>
  );
}
