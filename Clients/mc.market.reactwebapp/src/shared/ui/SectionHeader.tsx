import { Link } from "react-router";
import { cx } from "../lib/cx";

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: { to: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cx("mb-8 flex items-end justify-between lg:mb-10", className)}
    >
      <div>
        <h2 className="text-foreground font-display text-[28px] font-bold sm:text-[34px] lg:text-[38px]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground mt-1.5 text-sm font-light">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          to={action.to}
          className="text-muted-foreground hover:text-foreground ml-4 shrink-0 font-mono text-xs tracking-wide transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
