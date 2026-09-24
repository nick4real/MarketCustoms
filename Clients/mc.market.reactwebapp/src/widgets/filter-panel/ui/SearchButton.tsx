import { useListingStoreActions } from "@/entities/listing";
import { useIsFetching } from "@tanstack/react-query";

export default function SearchButton() {
  const { applySearch } = useListingStoreActions();
  const isSearching = useIsFetching({ queryKey: ["listings"] }) > 0;

  return (
    <button
      type="button"
      className="bg-primary text-primary-foreground mb-7 w-full px-4 py-1.5 text-center text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      style={{ borderRadius: "2px" }}
      onClick={applySearch}
      disabled={isSearching}
    >
      Search
    </button>
  );
}
