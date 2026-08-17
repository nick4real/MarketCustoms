import { Link } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";

interface Props {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

function MenuPanel({ isMenuOpen, toggleMenu }: Props) {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  if (!isMenuOpen) {
    return null;
  }

  const linkClass =
    "block rounded-lg px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-amber-50 dark:text-zinc-100 dark:hover:bg-zinc-800";

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40 md:hidden"
        onClick={toggleMenu}
        aria-label="Close menu overlay"
      />
      <nav className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col gap-1 border-r border-zinc-200 bg-white p-4 pt-16 shadow-xl dark:border-zinc-800 dark:bg-neutral-950 md:hidden">
        <Link to="/" className={linkClass} onClick={toggleMenu}>
          Home
        </Link>
        <Link to="/browse" className={linkClass} onClick={toggleMenu}>
          Browse
        </Link>
        {isAuthenticated && (
          <Link to="/dashboard" className={linkClass} onClick={toggleMenu}>
            Dashboard
          </Link>
        )}
        <div className="mt-auto flex flex-col gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {isAuthenticated ? (
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600"
              onClick={() => {
                toggleMenu();
                logout({ logoutParams: { returnTo: window.location.origin } });
              }}
            >
              Sign out
            </button>
          ) : (
            <>
              <button
                type="button"
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium dark:border-zinc-600"
                onClick={() => {
                  toggleMenu();
                  loginWithRedirect();
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-900"
                onClick={() => {
                  toggleMenu();
                  loginWithRedirect({
                    authorizationParams: { screen_hint: "signup" },
                  });
                }}
              >
                Create account
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default MenuPanel;
