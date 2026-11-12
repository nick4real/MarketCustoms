import type { ListingCondition } from "../model/types";

export function ConditionBadge({
  condition,
}: {
  condition: ListingCondition | null;
}) {
  const label = condition
    ? condition.charAt(0).toUpperCase() + condition.slice(1)
    : "—";

  return (
    <span className="bg-secondary text-muted-foreground shrink-0 px-1.5 py-0.5 font-mono text-[10px]">
      {label}
    </span>
  );
}
