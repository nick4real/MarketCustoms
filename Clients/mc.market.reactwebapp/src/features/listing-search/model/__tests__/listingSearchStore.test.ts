import { describe, expect, it } from "vitest";
import { createListingSearchStore } from "../listingSearchStore";
import { DEFAULT_PAGE_SIZE, type UrlListingSearch } from "../searchParams";

const search: UrlListingSearch = {
  searchText: "camera",
  sort: "priceAsc",
  condition: "used",
  categoryId: 7,
  maxPrice: null,
  minPrice: null,
  pageIndex: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

describe("listing search store", () => {
  it("applySearch applies the selections and returns the applied search", () => {
    const store = createListingSearchStore({});
    const { actions } = store.getState();
    actions.setSearchText("  camera ");
    actions.setSelectedSort("priceAsc");
    actions.setSelectedCondition("used");
    actions.setSelectedCategoryId(7);

    const applied = actions.applySearch();

    expect(applied).toEqual(store.getState().applied);
    expect(applied).toMatchObject({ ...search, searchId: 1 });
  });

  it("loadSearch replaces selections and the applied search", () => {
    const store = createListingSearchStore({});
    const { actions } = store.getState();
    actions.setSelectedCondition("new");
    actions.applySearch();

    actions.loadSearch(search);

    const state = store.getState();
    expect(state).toMatchObject({
      searchText: "camera",
      selectedSort: "priceAsc",
      selectedCondition: "used",
      selectedCategoryId: 7,
    });
    expect(state.applied).toEqual({
      ...search,
      categoryName: null,
      searchId: 1,
    });
  });

  it("loadSearch keeps the category name when the category is unchanged", () => {
    const store = createListingSearchStore({});
    const { actions } = store.getState();
    actions.setSelectedCategoryId(7);
    actions.applySearch();
    actions.setAppliedCategoryName(7, "Cameras");

    actions.loadSearch({ ...search, sort: "dateDesc" });

    expect(store.getState().applied.categoryName).toBe("Cameras");
    expect(store.getState().selectedCategoryName).toBe("Cameras");
  });

  it("setPage changes only the applied page", () => {
    const store = createListingSearchStore({});
    const { actions } = store.getState();
    actions.setSelectedCondition("used");
    actions.applySearch();
    actions.setSelectedSort("priceDesc");
    const before = store.getState();

    actions.setPage(3);

    const after = store.getState();
    expect(after.applied).toEqual({ ...before.applied, pageIndex: 3 });
    expect(after.selectedSort).toBe("priceDesc");
  });

  it("setPageSize changes the applied page size and returns to page 1", () => {
    const store = createListingSearchStore({});
    const { actions } = store.getState();
    actions.applySearch();
    actions.setPage(3);
    actions.setSelectedSort("priceDesc");
    const before = store.getState();

    actions.setPageSize(48);

    const after = store.getState();
    expect(after.applied).toEqual({
      ...before.applied,
      pageIndex: 1,
      pageSize: 48,
    });
    expect(after.selectedSort).toBe("priceDesc");
  });
});
