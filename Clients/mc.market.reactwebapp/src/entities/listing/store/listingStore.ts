import { createStore, useStore } from "zustand";
import type { ListingCondition, ListingSort } from "../model/types";
import { useContext } from "react";
import { ListingStoreContext } from "./listingStoreContext";

export interface AppliedListingSearch {
  searchText: string | null;
  sort: ListingSort | null;
  condition: ListingCondition | null;
  categoryId: number | null;
  categoryName: string | null;
  maxPrice: number | null;
  minPrice: number | null;
  pageIndex: number;
  pageSize: number;
  searchId: number;
}

export interface ListingState {
  searchText: string | null;
  selectedSort: ListingSort | null;
  selectedCondition: ListingCondition | null;
  selectedCategoryId: number | null;
  selectedCategoryName: string | null;
  selectedMaxPrice: number | null;
  selectedMinPrice: number | null;
  applied: AppliedListingSearch;
  actions: {
    setSearchText: (text: string | null) => void;
    setSelectedCategoryId: (id: number | null) => void;
    setSelectedCategoryName: (name: string | null) => void;
    setAppliedCategoryName: (categoryId: number, name: string) => void;
    setSelectedSort: (sort: ListingSort | null) => void;
    setSelectedCondition: (condition: ListingCondition | null) => void;
    setSelectedMaxPrice: (price: number | null) => void;
    setSelectedMinPrice: (price: number | null) => void;
    applySearch: () => void;
  };
}

const defaultApplied = (
  initialState: Partial<ListingState>,
): AppliedListingSearch => ({
  searchText: initialState.searchText ?? null,
  sort: initialState.selectedSort ?? null,
  condition: initialState.selectedCondition ?? null,
  categoryId: initialState.selectedCategoryId ?? null,
  categoryName: initialState.selectedCategoryName ?? null,
  maxPrice: initialState.selectedMaxPrice ?? null,
  minPrice: initialState.selectedMinPrice ?? null,
  pageIndex: 1,
  pageSize: 12,
  searchId: 0,
});

export const createListingStore = (initialState: Partial<ListingState>) => {
  return createStore<ListingState>((set) => ({
    searchText: initialState.searchText ?? null,
    selectedSort: initialState.selectedSort ?? null,
    selectedCondition: initialState.selectedCondition ?? null,
    selectedCategoryId: initialState.selectedCategoryId ?? null,
    selectedCategoryName: initialState.selectedCategoryName ?? null,
    selectedMaxPrice: initialState.selectedMaxPrice ?? null,
    selectedMinPrice: initialState.selectedMinPrice ?? null,
    applied: initialState.applied ?? defaultApplied(initialState),
    actions: {
      setSearchText: (text: string | null) => set({ searchText: text }),
      setSelectedCategoryId: (id: number | null) =>
        set({ selectedCategoryId: id }),
      setSelectedCategoryName: (name: string | null) =>
        set({ selectedCategoryName: name }),
      setAppliedCategoryName: (categoryId: number, name: string) =>
        set((state) => {
          if (
            state.applied.categoryId !== categoryId ||
            state.applied.categoryName === name
          ) {
            return state;
          }
          return { applied: { ...state.applied, categoryName: name } };
        }),
      setSelectedSort: (sort: ListingSort | null) =>
        set({ selectedSort: sort }),
      setSelectedCondition: (condition: ListingCondition | null) =>
        set({ selectedCondition: condition }),
      setSelectedMaxPrice: (price: number | null) =>
        set({ selectedMaxPrice: price }),
      setSelectedMinPrice: (price: number | null) =>
        set({ selectedMinPrice: price }),
      applySearch: () =>
        set((state) => ({
          applied: {
            searchText: state.searchText?.trim() || null,
            sort: state.selectedSort,
            condition: state.selectedCondition,
            categoryId: state.selectedCategoryId,
            categoryName: state.selectedCategoryName,
            maxPrice: state.selectedMaxPrice,
            minPrice: state.selectedMinPrice,
            pageIndex: 1,
            pageSize: state.applied.pageSize,
            searchId: state.applied.searchId + 1,
          },
        })),
    },
  }));
};

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

export const useAppliedListingSearch = () =>
  useListingStore((state) => state.applied);
