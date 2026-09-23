import {
  getListings,
  useListingStoreState,
  type ListingPaginatedResponse,
} from "@/entities/listing";
import { useQuery } from "@tanstack/react-query";

export default function SearchButton() {
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
    queryFn: () =>
      getListings({
        pageIndex: pageIndex,
        pageSize: pageSize,
        categoryId: selectedCategoryId ?? undefined,
        sort: selectedSort ?? undefined,
      }),
    enabled: false,
  });

  const useSearch = async () => {
    const result = await query.refetch();
    console.log("useSearch" + result.data);
    setListings(result.data?.items ?? []);
    if (result.data) {
      setTotalPages(result.data.totalPages);
      setHasNextPage(result.data.hasNextPage);
      setHasPreviousPage(result.data.hasPreviousPage);
      setPageSize(result.data.pageSize);
      setPageIndex(result.data.pageIndex);
    }
  };

  return (
    <button
      type="button"
      className="bg-primary text-primary-foreground mb-7 w-full px-4 py-1.5 text-center text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      style={{ borderRadius: "2px" }}
      onClick={useSearch}
    >
      Search
    </button>
  );
}
