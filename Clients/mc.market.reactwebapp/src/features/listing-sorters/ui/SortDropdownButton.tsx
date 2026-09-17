import type { ListingSort } from "@/entities/listing";

export interface SortDropdownButtonProps {
  sort: ListingSort;
  setSort: (sort: ListingSort) => void;
}

export function SortDropdownButton({ sort, setSort }: SortDropdownButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-muted-foreground hidden text-xs md:block"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        Sort
      </span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as ListingSort)}
        className="border-border bg-card text-foreground focus:border-primary cursor-pointer border px-2 py-1.5 text-xs focus:outline-none md:px-3 md:text-sm"
        style={{
          borderRadius: "2px",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <option value="newest">Recent</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
      </select>
    </div>
  );
}
