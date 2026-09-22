import {
  type ListingCondition,
  LISTING_CONDITIONS,
  useListingStoreState,
} from "@/entities/listing";

export function ConditionFilter() {
  const {
    selectedCondition,
    actions: { setSelectedCondition },
  } = useListingStoreState();

  const conditions = ["any", ...LISTING_CONDITIONS];

  return (
    <div className="mb-7">
      <h3
        className="text-muted-foreground mb-3 text-[10px] tracking-[0.15em] uppercase"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        Condition
      </h3>
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
            className={`px-2 py-1.5 text-left text-sm transition-colors ${
              selectedCondition === cond ||
              (selectedCondition === null && cond === "any")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground-muted"
            }`}
            style={{ borderRadius: "2px" }}
          >
            {cond.charAt(0).toUpperCase() + cond.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
