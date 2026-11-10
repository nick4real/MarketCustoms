import { ButtonLink } from "@/shared";

export default function EmailVerificationNotice() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <span className="bg-primary h-px w-6 shrink-0" />
          <span className="text-primary font-mono text-[10px] tracking-[0.2em] uppercase">
            Verify email
          </span>
        </div>
        <h1 className="text-foreground font-display mb-4 text-[32px] leading-[0.95] font-black tracking-tight md:text-[40px]">
          Check your inbox.
        </h1>
        <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed font-light">
          You're signed in, but this account isn't fully usable until you verify
          your email. Profile, orders, and settings stay closed until then. You
          can keep browsing the market.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <ButtonLink to="/" size="lg">
            Continue browsing
          </ButtonLink>
          <ButtonLink to="/browse" variant="outline" size="lg">
            Browse listings
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
