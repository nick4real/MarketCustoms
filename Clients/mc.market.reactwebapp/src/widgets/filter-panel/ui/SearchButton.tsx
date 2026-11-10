import { useListingStoreActions } from "@/entities/listing";
import { Button } from "@/shared";
import { useIsFetching } from "@tanstack/react-query";

export default function SearchButton() {
  const { applySearch } = useListingStoreActions();
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
