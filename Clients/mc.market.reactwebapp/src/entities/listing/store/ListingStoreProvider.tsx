import { useState, type ReactNode } from "react";
import { ListingStoreContext } from "./listingStoreContext";
import { createListingStore } from "./listingStore";
import { useSearchParams } from "react-router";
import { parsePositiveInteger } from "@/shared/lib/parseJson";
import { parseListingCondition, parseListingSort } from "../model/parse";

export const ListingStoreProvider = ({ children }: { children: ReactNode }) => {
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

    return createListingStore({
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
    <ListingStoreContext.Provider value={listingStore}>
      {children}
    </ListingStoreContext.Provider>
  );
};
