import { useState, type ReactNode } from "react";
import { ListingStoreContext } from "./listingStoreContext";
import { createListingStore } from "./listingStore";

export const ListingStoreProvider = ({ children }: { children: ReactNode }) => {
  const [listingStore] = useState(() => createListingStore);

  return (
    <ListingStoreContext.Provider value={listingStore}>
      {children}
    </ListingStoreContext.Provider>
  );
};
