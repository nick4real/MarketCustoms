import { createContext } from "react";
import type { StoreApi } from "zustand";
import type { ListingSearchState } from "./listingSearchStore";

export const ListingSearchContext =
  createContext<StoreApi<ListingSearchState> | null>(null);
