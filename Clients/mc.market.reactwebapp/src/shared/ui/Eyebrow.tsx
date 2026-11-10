import type { ReactNode } from "react";
import { cx } from "../lib/cx";

export function Eyebrow({
  as: Tag = "p",
  className,
  children,
}: {
  as?: "p" | "span" | "h2" | "h3" | "h4" | "div";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={cx(
        "text-muted-foreground font-mono text-[10px] tracking-[0.15em] uppercase",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
