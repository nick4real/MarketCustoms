import { useListingSearchActions } from "../model/listingSearchStore";
import { Button } from "@/shared/ui";
import { useIsFetching } from "@tanstack/react-query";

export function SearchButton() {
  const { applySearch } = useListingSearchActions();
  const isSearching = useIsFetching({ queryKey: ["listings"] }) > 0;

  return (
    <Button
      className="mb-7 w-full"
      onClick={applySearch}
      disabled={isSearching}
    >
      Search
    </Button>
  );
}
