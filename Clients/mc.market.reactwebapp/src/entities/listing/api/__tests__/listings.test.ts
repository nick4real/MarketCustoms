import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getListingById,
  getListings,
  mapListing,
  mapListingView,
  mapPaginatedListings,
} from "@/entities/listing/api/listings";

const listingPage = {
  items: [
    {
      id: "64f1c2a0b4d5e6f708901234",
      title: "Leica M6 TTL Black",
      description: "Film camera",
      condition: "used",
      price: 2400,
      imageId: "photo-1606983340126-99ab4feaa64a",
    },
  ],
  pageSize: 12,
  pageIndex: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("mapListingPage", () => {
  it("maps a listings page payload", () => {
    expect(mapPaginatedListings(listingPage)).toEqual(listingPage);
  });

  it("rejects a payload without items", () => {
    expect(() =>
      mapPaginatedListings({
        pageSize: 12,
        pageIndex: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    ).toThrow(/Invalid listings response/);
  });
});

describe("getListings", () => {
  it("uses GET when there is no filter or sort body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(listingPage));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getListings({ pageSize: 4 })).resolves.toEqual(listingPage);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/listings?pageSize=4",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("omits non-positive pageIndex", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(listingPage));
    vi.stubGlobal("fetch", fetchMock);

    await getListings({ pageIndex: 0, pageSize: 12 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/listings?pageSize=12",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("POSTs JSON ListingParams when title is set", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(listingPage));
    vi.stubGlobal("fetch", fetchMock);

    await getListings({ title: "  Leica  ", pageSize: 12 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/listings?pageSize=12",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Leica" }),
      }),
    );
  });

  it("POSTs JSON ListingParams when categoryId or sort is set", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(listingPage));
    vi.stubGlobal("fetch", fetchMock);

    await getListings({ categoryId: 3, sort: "priceAsc", pageIndex: 1 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/listings?pageIndex=1",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ categoryId: 3, sort: "priceAsc" }),
      }),
    );
  });
});

describe("mapListingView", () => {
  it("normalises a PascalCase condition", () => {
    expect(
      mapListingView({ ...listingPage.items[0], condition: "Used" }).condition,
    ).toBe("used");
  });

  it("rejects an unknown condition", () => {
    expect(() =>
      mapListingView({ ...listingPage.items[0], condition: "Mint" }),
    ).toThrow(/Invalid listing view/);
  });
});

const detail = {
  id: "l1",
  ownerId: "o1",
  title: "Leica",
  description: "Film",
  categoryId: 3,
  category: { id: 3, name: "Cameras" },
  location: {
    country: "JP",
    region: null,
    city: "Tokyo",
    district: null,
    latitude: 0,
    longitude: 0,
  },
  createdAt: "2026-08-01T00:00:00Z",
  price: 2400,
  stock: 1,
  images: ["p1"],
  tags: ["film"],
  parameters: [{ name: "Mount", value: "M" }],
};

describe("mapListing", () => {
  it("maps a detail payload and defaults absent seller fields to null", () => {
    expect(mapListing(detail)).toMatchObject({
      id: "l1",
      categoryId: 3,
      condition: null,
      sellerRating: null,
      sellerSales: null,
      location: { country: "JP", region: null, city: "Tokyo" },
    });
  });

  it("maps a null location to null", () => {
    expect(mapListing({ ...detail, location: null }).location).toBeNull();
  });

  it("rejects a payload without an id", () => {
    expect(() => mapListing({ ...detail, id: "" })).toThrow(/Invalid listing/);
  });
});

describe("getListingById", () => {
  it("passes the abort signal and maps the body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(detail));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;

    await expect(getListingById("l1", signal)).resolves.toMatchObject({
      id: "l1",
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/listings/l1", { signal });
  });
});
