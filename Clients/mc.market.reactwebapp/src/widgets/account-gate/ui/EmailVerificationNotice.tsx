import { Link } from "react-router";

export default function EmailVerificationNotice() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <span className="bg-primary h-px w-6 shrink-0" />
          <span
            className="text-primary text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Verify email
          </span>
        </div>
        <h1
          className="text-foreground mb-4 text-[32px] leading-[0.95] font-black tracking-tight md:text-[40px]"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Check your inbox.
        </h1>
        <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed font-light">
          You're signed in, but this account isn't fully usable until you verify
          your email. Profile, orders, and settings stay closed until then. You
          can keep browsing the market.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-3 text-sm font-semibold tracking-wide transition-colors"
            style={{ borderRadius: "2px" }}
          >
            Continue browsing
          </Link>
          <Link
            to="/browse"
            className="border-border-subtle text-foreground hover:border-border-emphasis border px-6 py-3 text-sm font-medium tracking-wide transition-colors"
            style={{ borderRadius: "2px" }}
          >
            Browse listings
          </Link>
        </div>
      </div>
    </div>
  );
}
