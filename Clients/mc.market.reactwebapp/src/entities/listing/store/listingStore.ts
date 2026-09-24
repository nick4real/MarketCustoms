import { createStore, useStore } from "zustand";
import type {
  ListingCondition,
  ListingSort,
  ListingPaginatedResponse,
} from "../model/types";
import { useContext } from "react";
import { ListingStoreContext } from "./listingStoreContext";

export interface ListingState {
  listingsPaginated: ListingPaginatedResponse;
  searchText: string | null;
  selectedSort: ListingSort | null;
  selectedCondition: ListingCondition | null;
  selectedCategoryId: number | null;
  selectedCategoryName: string | null;
  selectedMaxPrice: number | null;
  selectedMinPrice: number | null;
  actions: {
    setListingsPaginated: (listings: ListingPaginatedResponse) => void;
    setSearchText: (text: string | null) => void;
    setSelectedCategoryId: (id: number | null) => void;
    setSelectedCategoryName: (name: string | null) => void;
    setSelectedSort: (sort: ListingSort | null) => void;
    setSelectedCondition: (condition: ListingCondition | null) => void;
    setSelectedMaxPrice: (price: number | null) => void;
    setSelectedMinPrice: (price: number | null) => void;
  };
}

export const createListingStore = (initialState: Partial<ListingState>) => {
  return createStore<ListingState>((set) => ({
    listingsPaginated: initialState.listingsPaginated ?? {
      items: [],
      pageSize: 12,
      pageIndex: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    searchText: initialState.searchText ?? null,
    selectedSort: initialState.selectedSort ?? null,
    selectedCondition: initialState.selectedCondition ?? null,
    selectedCategoryId: initialState.selectedCategoryId ?? null,
    selectedCategoryName: initialState.selectedCategoryName ?? null,
    selectedMaxPrice: initialState.selectedMaxPrice ?? null,
    selectedMinPrice: initialState.selectedMinPrice ?? null,
    actions: {
      setListingsPaginated: (listings: ListingPaginatedResponse) =>
        set({ listingsPaginated: listings }),
      setSearchText: (text: string | null) => set({ searchText: text }),
      setSelectedCategoryId: (id: number | null) =>
        set({ selectedCategoryId: id }),
      setSelectedCategoryName: (name: string | null) =>
        set({ selectedCategoryName: name }),
      setSelectedSort: (sort: ListingSort | null) =>
        set({ selectedSort: sort }),
      setSelectedCondition: (condition: ListingCondition | null) =>
        set({ selectedCondition: condition }),
      setSelectedMaxPrice: (price: number | null) =>
        set({ selectedMaxPrice: price }),
      setSelectedMinPrice: (price: number | null) =>
        set({ selectedMinPrice: price }),
    },
  }));
};

// Hooks
const useListingStore = <T>(selector: (state: ListingState) => T) => {
  const store = useContext(ListingStoreContext);
  if (!store) {
    throw new Error("Listing store not found");
  }
  return useStore(store, selector);
};

export const useListingStoreState = () => useListingStore((state) => state);

export const useListingStoreActions = () =>
  useListingStore((state) => state.actions);
