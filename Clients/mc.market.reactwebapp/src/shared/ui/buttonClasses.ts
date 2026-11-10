import { cx } from "../lib/cx";

export type ButtonVariant = "primary" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "rounded-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary-hover font-semibold",
  outline:
    "border border-border-subtle text-foreground hover:border-border-emphasis font-medium",
  danger:
    "border border-destructive/30 text-destructive hover:border-destructive/70",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm tracking-wide",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
}): string {
  return cx(BASE, VARIANTS[variant], SIZES[size]);
}
