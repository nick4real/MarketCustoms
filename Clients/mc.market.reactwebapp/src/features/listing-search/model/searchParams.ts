import { parseListingCondition, parseListingSort } from "@/entities/listing";
import { parsePositiveInteger } from "@/shared/lib";
import type { AppliedListingSearch } from "./listingSearchStore";

export const PAGE_SIZES: readonly number[] = [12, 24, 48];
export const DEFAULT_PAGE_SIZE = 12;

// Only the sizes the UI offers; anything else (e.g. ?pageSize=5000) falls back to the default.
const parsePageSize = (value: string | null) => {
  const size = parsePositiveInteger(value);
  return size !== null && PAGE_SIZES.includes(size) ? size : DEFAULT_PAGE_SIZE;
};

// The part of an applied search that lives in the Browse URL.
export type UrlListingSearch = Omit<
  AppliedListingSearch,
  "categoryName" | "searchId"
>;

export function searchFromParams(params: URLSearchParams): UrlListingSearch {
  return {
    searchText: params.get("search")?.trim() || null,
    sort: parseListingSort(params.get("sort")),
    condition: parseListingCondition(params.get("condition")),
    categoryId: parsePositiveInteger(params.get("categoryId")),
    maxPrice: parsePositiveInteger(params.get("maxPrice")),
    minPrice: parsePositiveInteger(params.get("minPrice")),
    pageIndex: parsePositiveInteger(params.get("pageIndex")) ?? 1,
    pageSize: parsePageSize(params.get("pageSize")),
  };
}

export function searchToParams(search: UrlListingSearch): URLSearchParams {
  const params = new URLSearchParams();
  const setIf = (
    key: string,
    value: string | number | null,
    skip?: unknown,
  ) => {
    if (value !== null && value !== "" && value !== skip) {
      params.set(key, String(value));
    }
  };
  setIf("search", search.searchText);
  setIf("sort", search.sort);
  setIf("condition", search.condition);
  setIf("categoryId", search.categoryId);
  setIf("minPrice", search.minPrice);
  setIf("maxPrice", search.maxPrice);
  setIf("pageIndex", search.pageIndex, 1);
  setIf("pageSize", search.pageSize, DEFAULT_PAGE_SIZE);
  return params;
}

// Same search, ignoring parameter order, defaults and unknown parameters.
export function isSameSearchUrl(a: URLSearchParams, b: URLSearchParams) {
  return isSameSearch(searchFromParams(a), searchFromParams(b));
}

export function isSameSearch(a: UrlListingSearch, b: UrlListingSearch) {
  return (
    a.searchText === b.searchText &&
    a.sort === b.sort &&
    a.condition === b.condition &&
    a.categoryId === b.categoryId &&
    a.maxPrice === b.maxPrice &&
    a.minPrice === b.minPrice &&
    a.pageIndex === b.pageIndex &&
    a.pageSize === b.pageSize
  );
}
