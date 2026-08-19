import { Link } from "react-router";
import { useAuth0 } from "@auth0/auth0-react";
import { useOnboarding } from "../auth/OnboardingGate";

interface Props {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

function Header({ isMenuOpen, toggleMenu }: Props) {
  const { isLoading, isAuthenticated, loginWithRedirect, logout, user } =
    useAuth0();
  const onboarding = useOnboarding();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex h-14 max-w-8xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white"
        >
          Market<span className="text-amber-500">Customs</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-zinc-600 transition hover:text-amber-600 dark:text-zinc-300"
          >
            Home
          </Link>
          <Link
            to="/browse"
            className="text-sm font-medium text-zinc-600 transition hover:text-amber-600 dark:text-zinc-300"
          >
            Browse
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="text-sm font-medium text-zinc-600 transition hover:text-amber-600 dark:text-zinc-300"
            >
              Dashboard
            </Link>
          )}
          {onboarding?.isVerified && (
            <Link
              to="/profile/seller"
              className="text-sm font-medium text-zinc-600 transition hover:text-amber-600 dark:text-zinc-300"
            >
              {onboarding.isSeller ? "Seller profile" : "Become a seller"}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? null : isAuthenticated ? (
            <>
              <img
                src={user?.picture}
                alt={user?.name ?? "User"}
                className="hidden h-8 w-8 rounded-full sm:block"
              />
              <span className="hidden max-w-[120px] truncate text-sm text-zinc-700 dark:text-zinc-300 sm:block">
                {user?.name}
              </span>
              <button
                type="button"
                className="hidden rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-200 md:inline-block"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="hidden text-sm font-medium text-zinc-600 transition hover:text-amber-600 dark:text-zinc-300 md:inline-block"
                onClick={() => loginWithRedirect()}
              >
                Sign in
              </button>
              <button
                type="button"
                className="hidden rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400 md:inline-block"
                onClick={() =>
                  loginWithRedirect({
                    authorizationParams: { screen_hint: "signup" },
                  })
                }
              >
                Create account
              </button>
            </>
          )}

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg className="h-6 w-6" aria-hidden="true">
              {isMenuOpen ? (
                <use href="/icons.svg#close" />
              ) : (
                <use href="/icons.svg#menu" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
