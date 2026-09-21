import type { CategoryFilterRow } from "@/entities/category";
import { useSearchParams } from "react-router";

export interface CategoryFilterProps {
  categoryRows: CategoryFilterRow[];
  categoryStatus: "loading" | "ready" | "error";
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
}

export function CategoryFilter({
  categoryRows,
  categoryStatus,
  selectedCategoryId,
  setSelectedCategoryId,
}: CategoryFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="mb-7">
      <h3
        className="text-muted-foreground mb-3 text-[10px] tracking-[0.15em] uppercase"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        Category
      </h3>
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => setSelectedCategoryId(null)}
          className={`px-2 py-1.5 text-left text-sm transition-colors ${
            selectedCategoryId === null
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground-muted"
          }`}
          style={{ borderRadius: "2px" }}
        >
          All listings
        </button>
        {categoryStatus === "loading" ? (
          <p
            className="text-muted-foreground px-2 py-1.5 text-xs"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Loading categories…
          </p>
        ) : categoryStatus === "error" ? (
          <p
            className="text-muted-foreground px-2 py-1.5 text-xs"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            Couldn&apos;t load categories
          </p>
        ) : (
          categoryRows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelectedCategoryId(row.id)}
              className={`py-1.5 pr-2 text-left text-sm transition-colors ${
                selectedCategoryId === row.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground-muted"
              }`}
              style={{
                borderRadius: "2px",
                paddingLeft: `${8 + row.depth * 12}px`,
              }}
            >
              {row.name}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
