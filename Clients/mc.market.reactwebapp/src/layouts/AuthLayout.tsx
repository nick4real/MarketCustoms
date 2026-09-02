import { Link, Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-between px-5 md:px-10">
        <Link to="/" className="flex items-center">
          <span
            className="text-foreground text-[22px] leading-none font-black tracking-tighter"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            MKT<span className="text-primary">.</span>
          </span>
        </Link>
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground-muted text-xs tracking-[0.15em] uppercase transition-colors"
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
