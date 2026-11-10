import type { ListingSort } from "@/entities/listing";

export interface SortDropdownButtonProps {
  sort: ListingSort;
  setSort: (sort: ListingSort) => void;
}

export function SortDropdownButton({ sort, setSort }: SortDropdownButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground hidden font-mono text-xs md:block">
        Sort
      </span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as ListingSort)}
        className="border-border bg-card text-foreground focus:border-primary cursor-pointer rounded-xs border px-2 py-1.5 text-xs focus:outline-none md:px-3 md:text-sm"
      >
        <option value="dateDesc">Recent</option>
        <option value="dateAsc">Oldest</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="popularityDesc">Popular</option>
        <option value="popularityAsc">Unpopular</option>
      </select>
    </div>
  );
}
