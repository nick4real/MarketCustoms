import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { ListingSearchContext } from "./context";
import { createListingSearchStore } from "./listingSearchStore";
import { isSameSearch, searchFromParams } from "./searchParams";

export const ListingSearchProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [searchParams] = useSearchParams();
  const [listingStore] = useState(() => {
    const search = searchFromParams(searchParams);
    return createListingSearchStore({
      searchText: search.searchText,
      selectedSort: search.sort,
      selectedCondition: search.condition,
      selectedCategoryId: search.categoryId,
      selectedMaxPrice: search.maxPrice,
      selectedMinPrice: search.minPrice,
      applied: { ...search, categoryName: null, searchId: 0 },
    });
  });

  // Search writes the applied search to the URL, so a mismatch here means the
  // URL changed from elsewhere (Back/Forward, a link) and the store must follow.
  useEffect(() => {
    const search = searchFromParams(searchParams);
    const { applied, actions } = listingStore.getState();
    if (!isSameSearch(search, applied)) {
      actions.loadSearch(search);
    }
  }, [listingStore, searchParams]);

  return (
    <ListingSearchContext.Provider value={listingStore}>
      {children}
    </ListingSearchContext.Provider>
  );
};
