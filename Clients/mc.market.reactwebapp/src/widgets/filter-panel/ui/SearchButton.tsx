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
    selectedCategoryId,
    selectedSort,
    pagination: { pageIndex, pageSize },
    actions: {
      setListings,
      setTotalPages,
      setHasNextPage,
      setHasPreviousPage,
      setPageSize,
      setPageIndex,
    },
  } = useListingStoreState();

  const query = useQuery<ListingPaginatedResponse, Error>({
    queryKey: [
      "listings",
      selectedCategoryId,
      selectedSort,
      pageIndex,
      pageSize,
    ],
    queryFn: () => {
      console.log("queryFn");
      setIsSearching(true);
      return getListings({
        pageIndex: pageIndex,
        pageSize: pageSize,
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

    setListings(data.items);
    setTotalPages(data.totalPages);
    setHasNextPage(data.hasNextPage);
    setHasPreviousPage(data.hasPreviousPage);
    setPageSize(data.pageSize);
    setPageIndex(data.pageIndex);
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
