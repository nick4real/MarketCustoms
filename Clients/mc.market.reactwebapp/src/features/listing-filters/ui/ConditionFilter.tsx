const conditions = ["Any", "New", "Used", "Damaged"];

export interface ConditionFilterProps {
  selectedCondition: string;
  setSelectedCondition: (condition: string) => void;
}

export function ConditionFilter({
  selectedCondition,
  setSelectedCondition,
}: ConditionFilterProps) {
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
            onClick={() => setSelectedCondition(cond)}
            className={`px-2 py-1.5 text-left text-sm transition-colors ${
              selectedCondition === cond
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground-muted"
            }`}
            style={{ borderRadius: "2px" }}
          >
            {cond}
          </button>
        ))}
      </div>
    </div>
  );
}
