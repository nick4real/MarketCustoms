import { type ListingCondition, LISTING_CONDITIONS } from "@/entities/listing";
import { useListingSearchState } from "../model/listingSearchStore";
import { cx } from "@/shared/lib";
import { Eyebrow } from "@/shared/ui";

export function ConditionFilter() {
  const {
    selectedCondition,
    actions: { setSelectedCondition },
  } = useListingSearchState();

  const conditions = ["any", ...LISTING_CONDITIONS];

  return (
    <div className="mb-7">
      <Eyebrow as="h3" className="mb-3">
        Condition
      </Eyebrow>
      <div className="flex flex-col gap-0.5">
        {conditions.map((cond) => (
          <button
            key={cond}
            type="button"
            onClick={() =>
              setSelectedCondition(
                cond === "any" ? null : (cond as ListingCondition),
              )
            }
            className={cx(
              "rounded-xs px-2 py-1.5 text-left text-sm transition-colors",
              selectedCondition === cond ||
                (selectedCondition === null && cond === "any")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground-muted",
            )}
          >
            {cond.charAt(0).toUpperCase() + cond.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
