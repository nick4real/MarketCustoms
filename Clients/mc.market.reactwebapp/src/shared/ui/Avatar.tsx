import { cx } from "../lib/cx";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<AvatarSize, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-xs",
  lg: "h-16 w-16 text-sm",
  xl: "h-20 w-20 text-lg md:h-24 md:w-24",
};

export function Avatar({
  src,
  initials,
  size = "sm",
  className,
}: {
  src?: string | null;
  initials: string;
  size?: AvatarSize;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "bg-secondary text-foreground-muted border-border-subtle flex shrink-0 items-center justify-center overflow-hidden rounded-full border font-semibold",
        SIZES[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="font-mono">{initials}</span>
      )}
    </div>
  );
}
