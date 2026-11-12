import { useListingSearchActions } from "../model/listingSearchStore";
import { Button } from "@/shared/ui";
import { useIsFetching } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { isSameSearchUrl, searchToParams } from "../model/searchParams";

export function SearchButton() {
  const { applySearch } = useListingSearchActions();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSearching = useIsFetching({ queryKey: ["listings"] }) > 0;

  const handleSearch = () => {
    const next = searchToParams(applySearch());
    // Re-running the same search refetches but shouldn't add a history entry.
    setSearchParams(next, {
      replace: isSameSearchUrl(next, searchParams),
    });
  };

  return (
    <Button
      className="mb-7 w-full"
      onClick={handleSearch}
      disabled={isSearching}
    >
      Search
    </Button>
  );
}
