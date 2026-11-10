import type { ReactNode } from "react";
import { cx } from "../lib/cx";

const CONTAINERS = {
  page: "bg-background flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center",
  block: "flex flex-col items-center justify-center py-24 text-center",
} as const;

export function StatusMessage({
  message,
  symbol,
  size = "block",
  className,
  children,
}: {
  message: string;
  symbol?: string;
  size?: "page" | "block" | "inline";
  className?: string;
  children?: ReactNode;
}) {
  if (size === "inline") {
    return (
      <p className={cx("text-muted-foreground text-sm font-light", className)}>
        {message}
      </p>
    );
  }

  return (
    <div className={cx(CONTAINERS[size], className)}>
      {symbol && (
        <div className="text-border-subtle font-display mb-4 text-5xl">
          {symbol}
        </div>
      )}
      <p className="text-foreground-subtle font-mono text-xs tracking-widest">
        {message}
      </p>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
