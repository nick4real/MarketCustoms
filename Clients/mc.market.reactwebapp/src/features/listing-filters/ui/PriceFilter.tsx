import { Eyebrow } from "@/shared";

export function PriceFilter() {
  return (
    <div className="mb-2">
      <Eyebrow as="h3" className="mb-3">
        Price Range
      </Eyebrow>
      <div className="flex gap-2">
        <input
          placeholder="Min"
          aria-label="Minimum price"
          className="border-border bg-surface text-foreground placeholder-foreground-subtle focus:border-primary w-full rounded-xs border px-2 py-1.5 font-mono text-xs transition-colors focus:outline-none"
        />
        <input
          placeholder="Max"
          aria-label="Maximum price"
          className="border-border bg-surface text-foreground placeholder-foreground-subtle focus:border-primary w-full rounded-xs border px-2 py-1.5 font-mono text-xs transition-colors focus:outline-none"
        />
      </div>
    </div>
  );
}
