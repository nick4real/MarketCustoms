import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAGE_SIZE,
  isSameSearch,
  isSameSearchUrl,
  PAGE_SIZES,
  searchFromParams,
  searchToParams,
  type UrlListingSearch,
} from "../searchParams";

const emptySearch: UrlListingSearch = {
  searchText: null,
  sort: null,
  condition: null,
  categoryId: null,
  maxPrice: null,
  minPrice: null,
  pageIndex: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const fullSearch: UrlListingSearch = {
  searchText: "camera",
  sort: "priceAsc",
  condition: "used",
  categoryId: 7,
  maxPrice: 500,
  minPrice: 20,
  pageIndex: 3,
  pageSize: 24,
};

describe("searchFromParams", () => {
  it("returns defaults for an empty query string", () => {
    expect(searchFromParams(new URLSearchParams())).toEqual(emptySearch);
  });

  it("reads every filter", () => {
    const params = new URLSearchParams(
      "search=camera&sort=priceAsc&condition=used&categoryId=7&maxPrice=500&minPrice=20&pageIndex=3&pageSize=24",
    );
    expect(searchFromParams(params)).toEqual(fullSearch);
  });

  it("trims search text and ignores blank text", () => {
    expect(
      searchFromParams(new URLSearchParams("search=%20camera%20")).searchText,
    ).toBe("camera");
    expect(
      searchFromParams(new URLSearchParams("search=%20%20")).searchText,
    ).toBeNull();
  });

  it("ignores invalid values", () => {
    const params = new URLSearchParams(
      "sort=cheapest&condition=mint&categoryId=-1&maxPrice=abc&pageIndex=0&pageSize=1.5",
    );
    expect(searchFromParams(params)).toEqual(emptySearch);
  });
});

describe("searchFromParams page size", () => {
  it("accepts only the offered page sizes", () => {
    for (const size of PAGE_SIZES) {
      expect(
        searchFromParams(new URLSearchParams(`pageSize=${size}`)).pageSize,
      ).toBe(size);
    }
    expect(
      searchFromParams(new URLSearchParams("pageSize=5000")).pageSize,
    ).toBe(DEFAULT_PAGE_SIZE);
  });
});

describe("searchToParams", () => {
  it("omits empty and default values", () => {
    expect(searchToParams(emptySearch).toString()).toBe("");
  });

  it("writes every set filter", () => {
    const params = searchToParams(fullSearch);
    expect(params.get("search")).toBe("camera");
    expect(params.get("sort")).toBe("priceAsc");
    expect(params.get("condition")).toBe("used");
    expect(params.get("categoryId")).toBe("7");
    expect(params.get("maxPrice")).toBe("500");
    expect(params.get("minPrice")).toBe("20");
    expect(params.get("pageIndex")).toBe("3");
    expect(params.get("pageSize")).toBe("24");
  });

  it("round-trips through the URL", () => {
    expect(searchFromParams(searchToParams(fullSearch))).toEqual(fullSearch);
    expect(searchFromParams(searchToParams(emptySearch))).toEqual(emptySearch);
  });
});

describe("isSameSearch", () => {
  it("is true for equal searches, ignoring extra fields", () => {
    expect(
      isSameSearch(fullSearch, {
        ...fullSearch,
        categoryName: "Cameras",
        searchId: 4,
      } as UrlListingSearch),
    ).toBe(true);
  });

  it.each(Object.keys(fullSearch) as (keyof UrlListingSearch)[])(
    "is false when %s differs",
    (key) => {
      expect(isSameSearch(fullSearch, { ...fullSearch, [key]: null })).toBe(
        false,
      );
    },
  );
});

describe("isSameSearchUrl", () => {
  it("ignores parameter order, defaults and unknown parameters", () => {
    expect(
      isSameSearchUrl(
        new URLSearchParams("search=x&sort=dateAsc"),
        new URLSearchParams("sort=dateAsc&search=%20x&pageIndex=1&utm=ad"),
      ),
    ).toBe(true);
  });

  it("is false when a filter differs", () => {
    expect(
      isSameSearchUrl(
        new URLSearchParams("sort=dateAsc"),
        new URLSearchParams("sort=dateDesc"),
      ),
    ).toBe(false);
  });
});
