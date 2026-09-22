import { createStore, useStore } from "zustand";
import type {
  ListingCondition,
  ListingSort,
  ListingView,
} from "../model/types";
import { useContext } from "react";
import { ListingStoreContext } from "./listingStoreContext";

export interface ListingState {
  listings: ListingView[];
  searchText: string | null;
  selectedSort: ListingSort | null;
  selectedCondition: ListingCondition | null;
  selectedCategoryId: number | null;
  selectedCategoryName: string | null;
  selectedMaxPrice: number | null;
  selectedMinPrice: number | null;
  pagination: {
    pageSize: number;
    pageIndex: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  actions: {
    setListings: (listings: ListingView[]) => void;
    setSearchText: (text: string | null) => void;
    setSelectedCategoryId: (id: number | null) => void;
    setSelectedCategoryName: (name: string | null) => void;
    setSelectedSort: (sort: ListingSort | null) => void;
    setSelectedCondition: (condition: ListingCondition | null) => void;
    setSelectedMaxPrice: (price: number | null) => void;
    setSelectedMinPrice: (price: number | null) => void;
    setPageSize: (size: number) => void;
    setPageIndex: (index: number) => void;
    setTotalPages: (total: number) => void;
    setHasNextPage: (hasNext: boolean) => void;
    setHasPreviousPage: (hasPrevious: boolean) => void;
  };
}

export const createListingStore = (initialState: Partial<ListingState>) => {
  return createStore<ListingState>((set) => ({
    listings: initialState.listings ?? [],
    searchText: initialState.searchText ?? null,
    selectedSort: initialState.selectedSort ?? null,
    selectedCondition: initialState.selectedCondition ?? null,
    selectedCategoryId: initialState.selectedCategoryId ?? null,
    selectedCategoryName: initialState.selectedCategoryName ?? null,
    selectedMaxPrice: initialState.selectedMaxPrice ?? null,
    selectedMinPrice: initialState.selectedMinPrice ?? null,
    pagination: initialState.pagination ?? {
      pageSize: 12,
      pageIndex: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    actions: {
      setListings: (listings: ListingView[]) => set({ listings }),
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
      setPageSize: (size: number) =>
        set((state) => ({
          pagination: { ...state.pagination, pageSize: size },
        })),
      setPageIndex: (index: number) =>
        set((state) => ({
          pagination: { ...state.pagination, pageIndex: index },
        })),
      setTotalPages: (total: number) =>
        set((state) => ({
          pagination: { ...state.pagination, totalPages: total },
        })),
      setHasNextPage: (hasNext: boolean) =>
        set((state) => ({
          pagination: { ...state.pagination, hasNextPage: hasNext },
        })),
      setHasPreviousPage: (hasPrevious: boolean) =>
        set((state) => ({
          pagination: { ...state.pagination, hasPreviousPage: hasPrevious },
        })),
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
