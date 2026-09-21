import { createContext } from "react";
import type { StoreApi } from "zustand";
import type { ListingState } from "./listingStore";

export const ListingStoreContext = createContext<StoreApi<ListingState> | null>(
  null,
);
