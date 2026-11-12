import { useSearchParams } from "react-router";
import {
  useAppliedListingSearch,
  useListingSearchActions,
} from "../model/listingSearchStore";
import { PAGE_SIZES, searchToParams } from "../model/searchParams";

export function PageSizeSelect() {
  const applied = useAppliedListingSearch();
  const { setPageSize } = useListingSearchActions();
  const [, setSearchParams] = useSearchParams();

  // Applies immediately, like paging; pending filter picks stay pending.
  const handleChange = (pageSize: number) => {
    setPageSize(pageSize);
    setSearchParams(searchToParams({ ...applied, pageIndex: 1, pageSize }));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground hidden font-mono text-xs md:block">
        Show
      </span>
      <select
        aria-label="Listings per page"
        value={applied.pageSize}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="border-border bg-card text-foreground focus:border-primary cursor-pointer rounded-xs border px-2 py-1.5 text-xs focus:outline-none md:px-3 md:text-sm"
      >
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}
