import { useSearchParams } from "react-router";
import { Button } from "@/shared/ui";
import {
  useAppliedListingSearch,
  useListingSearchActions,
} from "../model/listingSearchStore";
import { shouldShowPagination } from "../model/pagination";
import { searchToParams } from "../model/searchParams";
import { useListingSearchQuery } from "../model/useListingSearchQuery";

export function SearchPagination() {
  const { data, isPlaceholderData } = useListingSearchQuery();
  const applied = useAppliedListingSearch();
  const { setPage } = useListingSearchActions();
  const [, setSearchParams] = useSearchParams();

  if (!data || !shouldShowPagination(data)) {
    return null;
  }

  const goToPage = (pageIndex: number) => {
    setPage(pageIndex);
    setSearchParams(searchToParams({ ...applied, pageIndex }));
    window.scrollTo({ top: 0 });
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-4"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={!data.hasPreviousPage || isPlaceholderData}
        onClick={() => goToPage(data.pageIndex - 1)}
      >
        ‹ Prev
      </Button>
      <span className="text-muted-foreground font-mono text-xs">
        Page {data.pageIndex} of {Math.max(data.totalPages, 1)}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={!data.hasNextPage || isPlaceholderData}
        onClick={() => goToPage(data.pageIndex + 1)}
      >
        Next ›
      </Button>
    </nav>
  );
}
