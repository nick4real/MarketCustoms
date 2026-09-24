import { useState, type ReactNode } from "react";
import { ListingStoreContext } from "./listingStoreContext";
import { createListingStore } from "./listingStore";
import { useSearchParams } from "react-router";
import { parsePositiveInteger } from "@/shared/lib/parseJson";
import { parseListingCondition, parseListingSort } from "../model/parse";

export const ListingStoreProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams] = useSearchParams();
  const initialState = {
    listingsPaginated: {
      items: [],
      pageSize: parsePositiveInteger(searchParams.get("pageSize")) ?? 12,
      pageIndex: parsePositiveInteger(searchParams.get("pageIndex")) ?? 1,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    searchText: searchParams.get("search"),
    selectedSort: parseListingSort(searchParams.get("sort")),
    selectedCondition: parseListingCondition(searchParams.get("condition")),
    selectedCategoryId: parsePositiveInteger(searchParams.get("categoryId")),
    selectedMaxPrice: parsePositiveInteger(searchParams.get("maxPrice")),
    selectedMinPrice: parsePositiveInteger(searchParams.get("minPrice")),
  };
  const [listingStore] = useState(() => createListingStore(initialState));

  return (
    <ListingStoreContext.Provider value={listingStore}>
      {children}
    </ListingStoreContext.Provider>
  );
};
