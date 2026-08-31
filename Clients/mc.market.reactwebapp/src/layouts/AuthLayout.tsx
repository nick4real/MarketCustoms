import { Link, Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080808]">
      <header className="flex h-14 items-center justify-between px-5 md:px-10">
        <Link to="/" className="flex items-center">
          <span
            className="text-[22px] leading-none font-black tracking-tighter text-[#f0ece3]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            MKT<span className="text-[#e8820c]">.</span>
          </span>
        </Link>
        <Link
          to="/"
          className="text-xs tracking-[0.15em] text-[#5a5550] uppercase transition-colors hover:text-[#a09890]"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Back to market
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <Outlet />
      </main>
    </div>
  );
}
