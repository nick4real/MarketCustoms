import {
  getListings,
  useListingStoreState,
  type ListingPaginatedResponse,
} from "@/entities/listing";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function SearchButton() {
  const [isSearching, setIsSearching] = useState(false);
  const {
    listingsPaginated,
    selectedCategoryId,
    selectedSort,
    actions: { setListingsPaginated },
  } = useListingStoreState();

  const query = useQuery<ListingPaginatedResponse, Error>({
    queryKey: [
      "listings",
      selectedCategoryId,
      selectedSort,
      listingsPaginated.pageIndex,
      listingsPaginated.pageSize,
    ],
    queryFn: () => {
      console.log("queryFn");
      setIsSearching(true);
      return getListings({
        pageIndex: listingsPaginated.pageIndex,
        pageSize: listingsPaginated.pageSize,
        categoryId: selectedCategoryId ?? undefined,
        sort: selectedSort ?? undefined,
      });
    },
    enabled: false,
  });

  const useSearch = async () => {
    const result = await query.refetch();
    const data = result.data;

    if (!data) return;

    setListingsPaginated(data);
    setIsSearching(false);
  };

  return (
    <button
      type="button"
      className="bg-primary text-primary-foreground mb-7 w-full px-4 py-1.5 text-center text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      style={{ borderRadius: "2px" }}
      onClick={useSearch}
      disabled={isSearching}
    >
      Search
    </button>
  );
}
