import { cx } from "../lib/cx";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("text-foreground font-display font-black", className)}>
      MKT<span className="text-primary">.</span>
    </span>
  );
}
