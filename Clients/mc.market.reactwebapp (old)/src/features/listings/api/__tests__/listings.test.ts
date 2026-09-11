import { afterEach, describe, expect, it, vi } from "vitest";
import { getListings, mapListingPage } from "@/features/listings/api/listings";

const listingPage = {
  items: [
    {
      id: "64f1c2a0b4d5e6f708901234",
      title: "Leica M6 TTL Black",
      description: "Film camera",
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
    expect(mapListingPage(listingPage)).toEqual(listingPage);
  });

  it("rejects a payload without items", () => {
    expect(() =>
      mapListingPage({
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
