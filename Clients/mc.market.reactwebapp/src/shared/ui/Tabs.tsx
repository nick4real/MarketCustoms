import { cx } from "../lib/cx";

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  disabled,
  className,
}: {
  items: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cx("border-border flex gap-8 border-b", className)}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={item.id === value}
          disabled={disabled}
          onClick={() => onChange(item.id)}
          className={cx(
            "border-b-2 pb-3 font-mono text-xs tracking-[0.15em] uppercase transition-colors",
            item.id === value
              ? "border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground-muted border-transparent",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
