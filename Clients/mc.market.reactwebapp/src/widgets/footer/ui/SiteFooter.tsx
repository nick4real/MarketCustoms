import { Logo } from "@/shared/ui";

export function SiteFooter() {
  return (
    <footer className="border-border flex flex-col gap-6 border-t px-6 py-8 sm:flex-row sm:items-center sm:justify-between md:px-12 lg:px-16 lg:py-10">
      <Logo className="text-2xl" />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {["About", "Sell", "Support", "Terms", "Privacy"].map((l) => (
          <span
            key={l}
            className="text-foreground-subtle hover:text-muted-foreground cursor-pointer font-mono text-xs transition-colors"
          >
            {l}
          </span>
        ))}
      </div>
      <span className="text-foreground-subtle font-mono text-[11px]">
        © 2026 MKT.
      </span>
    </footer>
  );
}
