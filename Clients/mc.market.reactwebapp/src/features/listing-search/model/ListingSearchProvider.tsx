import { useState, type ReactNode } from "react";
import { ListingSearchContext } from "./context";
import { createListingSearchStore } from "./listingSearchStore";
import { useSearchParams } from "react-router";
import { parsePositiveInteger } from "@/shared/lib";
import { parseListingCondition, parseListingSort } from "@/entities/listing";

export const ListingSearchProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [searchParams] = useSearchParams();
  const [listingStore] = useState(() => {
    const searchText = searchParams.get("search")?.trim() || null;
    const selectedSort = parseListingSort(searchParams.get("sort"));
    const selectedCondition = parseListingCondition(
      searchParams.get("condition"),
    );
    const selectedCategoryId = parsePositiveInteger(
      searchParams.get("categoryId"),
    );
    const selectedMaxPrice = parsePositiveInteger(searchParams.get("maxPrice"));
    const selectedMinPrice = parsePositiveInteger(searchParams.get("minPrice"));
    const pageSize = parsePositiveInteger(searchParams.get("pageSize")) ?? 12;
    const pageIndex = parsePositiveInteger(searchParams.get("pageIndex")) ?? 1;

    return createListingSearchStore({
      searchText,
      selectedSort,
      selectedCondition,
      selectedCategoryId,
      selectedMaxPrice,
      selectedMinPrice,
      applied: {
        searchText,
        sort: selectedSort,
        condition: selectedCondition,
        categoryId: selectedCategoryId,
        categoryName: null,
        maxPrice: selectedMaxPrice,
        minPrice: selectedMinPrice,
        pageIndex,
        pageSize,
        searchId: 0,
      },
    });
  });

  return (
    <ListingSearchContext.Provider value={listingStore}>
      {children}
    </ListingSearchContext.Provider>
  );
};
