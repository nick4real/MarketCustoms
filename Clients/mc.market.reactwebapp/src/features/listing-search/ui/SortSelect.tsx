import type { ListingSort } from "@/entities/listing";
import { useListingSearchState } from "../model/listingSearchStore";

export function SortSelect() {
  const {
    selectedSort,
    actions: { setSelectedSort },
  } = useListingSearchState();

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground hidden font-mono text-xs md:block">
        Sort
      </span>
      <select
        aria-label="Sort listings"
        value={selectedSort ?? "dateDesc"}
        onChange={(e) => setSelectedSort(e.target.value as ListingSort)}
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
