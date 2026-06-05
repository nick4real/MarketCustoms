interface Props {
  isMenuOpen: boolean;
  toggleMenu: () => void;
}

function Header({ isMenuOpen, toggleMenu }: Props) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-4 px-4 text-black backdrop-blur-xs transition dark:bg-neutral-900/90 dark:text-white">
        <div className="absolute inset-x-2 top-full h-px bg-black/20 dark:bg-white/20"></div>
        <a className="mr-auto" href="/">
          Marketplace
        </a>
        <button className="md:inline-block hidden">Sign in</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-full hidden md:inline-block">
          Create Account
        </button>
        <button className="md:hidden inline-block" onClick={toggleMenu}>
          <svg className="w-6 h-6 text-white">
            {isMenuOpen ? (
              <use href="/icons.svg#close" />
            ) : (
              <use href="/icons.svg#menu" />
            )}
          </svg>
        </button>
      </header>
    </>
  );
}

export default Header;
