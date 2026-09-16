export function PriceFilter() {
  return (
    <div>
      <h3
        className="text-muted-foreground mb-3 text-[10px] tracking-[0.15em] uppercase"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        Price Range
      </h3>
      <div className="flex gap-2">
        <input
          placeholder="Min"
          className="border-border bg-surface text-foreground placeholder-foreground-subtle focus:border-primary w-full border px-2 py-1.5 text-xs transition-colors focus:outline-none"
          style={{ borderRadius: "2px", fontFamily: "DM Mono, monospace" }}
        />
        <input
          placeholder="Max"
          className="border-border bg-surface text-foreground placeholder-foreground-subtle focus:border-primary w-full border px-2 py-1.5 text-xs transition-colors focus:outline-none"
          style={{ borderRadius: "2px", fontFamily: "DM Mono, monospace" }}
        />
      </div>
    </div>
  );
}
