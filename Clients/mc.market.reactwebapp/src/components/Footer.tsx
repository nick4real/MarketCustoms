import { Link } from "react-router";

function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-neutral-950">
      <div className="mx-auto grid max-w-8xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            Market<span className="text-amber-500">Customs</span>
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            A modern marketplace for buyers and independent sellers.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Shop
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link to="/browse" className="hover:text-amber-600">
                All products
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-amber-600">
                Featured
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Sell
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link to="/dashboard" className="hover:text-amber-600">
                Seller dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Company
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li>About</li>
            <li>Contact</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200 px-4 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        © {new Date().getFullYear()} MarketCustoms. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
