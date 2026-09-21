import { createStore, useStore } from "zustand";
import type {
  ListingCondition,
  ListingSort,
  ListingView,
  Category,
} from "../model/types";
import { useContext } from "react";
import { ListingStoreContext } from "./listingStoreContext";

export interface ListingState {
  listings: ListingView[];
  searchText: string;
  selectedSort: ListingSort;
  selectedCondition: ListingCondition;
  selectedCategory: Category | "all";
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
    setSearchText: (text: string) => void;
    setSelectedCategory: (category: Category | "all") => void;
    setSelectedSort: (sort: ListingSort) => void;
    setSelectedCondition: (condition: ListingCondition) => void;
    setSelectedMaxPrice: (price: number | null) => void;
    setSelectedMinPrice: (price: number | null) => void;
    setPageSize: (size: number) => void;
    setPageIndex: (index: number) => void;
    setTotalPages: (total: number) => void;
    setHasNextPage: (hasNext: boolean) => void;
    setHasPreviousPage: (hasPrevious: boolean) => void;
  };
}

export const createListingStore = createStore<ListingState>((set) => ({
  listings: [],
  searchText: "",
  selectedSort: "newest",
  selectedCondition: "any",
  selectedCategory: "all",
  selectedMaxPrice: null,
  selectedMinPrice: null,
  pagination: {
    pageSize: 12,
    pageIndex: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  actions: {
    setListings: (listings: ListingView[]) => set({ listings }),
    setSearchText: (text: string) => set({ searchText: text }),
    setSelectedCategory: (category: Category | "all") =>
      set({ selectedCategory: category }),
    setSelectedSort: (sort: ListingSort) => set({ selectedSort: sort }),
    setSelectedCondition: (condition: ListingCondition) =>
      set({ selectedCondition: condition }),
    setSelectedMaxPrice: (price: number | null) =>
      set({ selectedMaxPrice: price }),
    setSelectedMinPrice: (price: number | null) =>
      set({ selectedMinPrice: price }),
    setPageSize: (size: number) =>
      set((state) => ({ pagination: { ...state.pagination, pageSize: size } })),
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

// Hooks
const useListingStore = <T>(selector: (state: ListingState) => T) => {
  const store = useContext(ListingStoreContext);
  if (!store) {
    throw new Error("Listing store not found");
  }
  return useStore(store, selector);
};

export const useListings = () => useListingStore((state) => state.listings);

export const useListingStoreActions = () =>
  useListingStore((state) => state.actions);
