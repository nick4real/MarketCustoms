import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  flattenCategoryForest,
  getCategoryFullTree,
  getListings,
  getRootCategories,
  ListingCard,
  type CategoryFilterRow,
  type CategoryNode,
  type ListingPaginatedResponse,
  type ListingSort,
} from "@/features/listings";

const conditions = ["Any", "New", "Like New", "Excellent", "Good", "Vintage"];

const emptyPage: ListingPaginatedResponse = {
  items: [],
  pageSize: 0,
  pageIndex: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function parseCategoryId(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function FilterPanel({
  categoryRows,
  categoryStatus,
  selectedCategoryId,
  setSelectedCategoryId,
  selectedCondition,
  setSelectedCondition,
  search,
  setSearch,
}: {
  categoryRows: CategoryFilterRow[];
  categoryStatus: "loading" | "ready" | "error";
  selectedCategoryId: number | null;
  setSelectedCategoryId: (id: number | null) => void;
  selectedCondition: string;
  setSelectedCondition: (v: string) => void;
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <>
      {/* Search */}
      <div className="relative mb-7">
        <input
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-border bg-surface text-foreground placeholder-foreground-subtle focus:border-primary w-full border px-3 py-2 pl-8 text-sm transition-colors focus:outline-none"
          style={{ borderRadius: "2px", fontFamily: "Outfit, sans-serif" }}
        />
        <svg
          className="text-foreground-subtle absolute top-2.5 left-2.5"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      {/* Categories */}
      <div className="mb-7">
        <h3
          className="text-muted-foreground mb-3 text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Category
        </h3>
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className={`px-2 py-1.5 text-left text-sm transition-colors ${
              selectedCategoryId === null
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground-muted"
            }`}
            style={{ borderRadius: "2px" }}
          >
            All listings
          </button>
          {categoryStatus === "loading" ? (
            <p
              className="text-muted-foreground px-2 py-1.5 text-xs"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Loading categories…
            </p>
          ) : categoryStatus === "error" ? (
            <p
              className="text-muted-foreground px-2 py-1.5 text-xs"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Couldn&apos;t load categories
            </p>
          ) : (
            categoryRows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedCategoryId(row.id)}
                className={`py-1.5 pr-2 text-left text-sm transition-colors ${
                  selectedCategoryId === row.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground-muted"
                }`}
                style={{
                  borderRadius: "2px",
                  paddingLeft: `${8 + row.depth * 12}px`,
                }}
              >
                {row.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Condition */}
      <div className="mb-7">
        <h3
          className="text-muted-foreground mb-3 text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Condition
        </h3>
        <div className="flex flex-col gap-0.5">
          {conditions.map((cond) => (
            <button
              key={cond}
              type="button"
              onClick={() => setSelectedCondition(cond)}
              className={`px-2 py-1.5 text-left text-sm transition-colors ${
                selectedCondition === cond
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground-muted"
              }`}
              style={{ borderRadius: "2px" }}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3
          className="text-muted-foreground mb-3 text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Price Range
        </h3>
        <div className="flex gap-2">
          <input
            placeholder="Min"
            className="border-border bg-surface text-foreground placeholder-foreground-subtle focus:border-primary w-full border px-2 py-1.5 text-xs transition-colors focus:outline-none"
            style={{ borderRadius: "2px", fontFamily: "DM Mono, monospace" }}
          />
          <input
            placeholder="Max"
            className="border-border bg-surface text-foreground placeholder-foreground-subtle focus:border-primary w-full border px-2 py-1.5 text-xs transition-colors focus:outline-none"
            style={{ borderRadius: "2px", fontFamily: "DM Mono, monospace" }}
          />
        </div>
      </div>
    </>
  );
}

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCondition, setSelectedCondition] = useState("Any");
  const [sort, setSort] = useState<ListingSort>("newest");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryStatus, setCategoryStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [categoryRows, setCategoryRows] = useState<CategoryFilterRow[]>([]);
  const [listingsStatus, setListingsStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [listings, setListings] = useState<ListingPaginatedResponse>(emptyPage);

  const requestedCategoryId = parseCategoryId(searchParams.get("categoryId"));
  const selectedCategoryId = useMemo(() => {
    if (categoryStatus === "error") {
      return null;
    }
    if (requestedCategoryId === null) {
      return null;
    }
    if (categoryStatus !== "ready") {
      return requestedCategoryId;
    }
    return categoryRows.some((row) => row.id === requestedCategoryId)
      ? requestedCategoryId
      : null;
  }, [categoryRows, categoryStatus, requestedCategoryId]);

  const selectedCategoryName =
    categoryRows.find((row) => row.id === selectedCategoryId)?.name ?? null;

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        const roots = await getRootCategories(controller.signal);
        const forest: CategoryNode[] = await Promise.all(
          roots.map((root) => getCategoryFullTree(root.id, controller.signal)),
        );
        if (controller.signal.aborted) {
          return;
        }
        setCategoryRows(flattenCategoryForest(forest));
        setCategoryStatus("ready");
      } catch (error) {
        if (controller.signal.aborted || isAbortError(error)) {
          return;
        }
        setCategoryRows([]);
        setCategoryStatus("error");
      }
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      await Promise.resolve();
      if (controller.signal.aborted) {
        return;
      }
      setListingsStatus("loading");
      try {
        const page = await getListings(
          {
            categoryId: selectedCategoryId ?? undefined,
            sort,
          },
          controller.signal,
        );
        if (controller.signal.aborted) {
          return;
        }
        setListings(page);
        setListingsStatus("ready");
      } catch (error: unknown) {
        if (controller.signal.aborted || isAbortError(error)) {
          return;
        }
        setListings(emptyPage);
        setListingsStatus("error");
      }
    })();

    return () => controller.abort();
  }, [selectedCategoryId, sort]);

  const filtered = listings.items;

  const activeFilters =
    (selectedCategoryId !== null ? 1 : 0) +
    (selectedCondition !== "Any" ? 1 : 0) +
    (search ? 1 : 0);

  function setSelectedCategoryId(id: number | null) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (id === null) {
          next.delete("categoryId");
        } else {
          next.set("categoryId", String(id));
        }
        return next;
      },
      { replace: true },
    );
  }

  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="border-border sticky top-14 hidden h-[calc(100vh-56px)] w-56 shrink-0 self-start overflow-y-auto border-r p-6 md:block">
        <FilterPanel
          categoryRows={categoryRows}
          categoryStatus={categoryStatus}
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          selectedCondition={selectedCondition}
          setSelectedCondition={setSelectedCondition}
          search={search}
          setSearch={setSearch}
        />
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-4 py-5 md:border-0 md:px-8 md:py-8">
          <div>
            <h1
              className="text-foreground text-[26px] leading-none font-bold md:text-[32px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {selectedCategoryName ?? "All Listings"}
            </h1>
            <p
              className="text-muted-foreground mt-1.5 text-xs"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {listingsStatus === "ready"
                ? `${filtered.length} results`
                : listingsStatus === "loading"
                  ? "Loading…"
                  : "Unavailable"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              className="border-border text-foreground relative flex items-center gap-2 border px-3 py-1.5 text-sm md:hidden"
              style={{ borderRadius: "2px", fontFamily: "DM Mono, monospace" }}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="12" y1="18" x2="12" y2="18" />
              </svg>
              Filters
              {activeFilters > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold">
                  {activeFilters}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span
                className="text-muted-foreground hidden text-xs md:block"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Sort
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as ListingSort)}
                className="border-border bg-card text-foreground focus:border-primary cursor-pointer border px-2 py-1.5 text-xs focus:outline-none md:px-3 md:text-sm"
                style={{
                  borderRadius: "2px",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                <option value="newest">Recent</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile filter panel (collapsible) */}
        {filtersOpen && (
          <div className="border-border bg-surface-inset border-b px-4 py-6 md:hidden">
            <FilterPanel
              categoryRows={categoryRows}
              categoryStatus={categoryStatus}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              selectedCondition={selectedCondition}
              setSelectedCondition={setSelectedCondition}
              search={search}
              setSearch={setSearch}
            />
            <button
              className="bg-primary text-primary-foreground mt-4 w-full py-2.5 text-sm font-semibold"
              style={{ borderRadius: "2px" }}
              onClick={() => setFiltersOpen(false)}
            >
              Show {filtered.length} results
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="px-4 py-5 md:px-8 md:py-8">
          {listingsStatus === "loading" ? (
            <p
              className="text-foreground-subtle py-24 text-center text-xs tracking-widest"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Loading listings…
            </p>
          ) : listingsStatus === "error" ? (
            <p
              className="text-foreground-subtle py-24 text-center text-xs tracking-widest"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Couldn&apos;t load listings
            </p>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <ListingCard key={item.id} listing={item} showLocation />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="text-border-subtle mb-4 text-5xl"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                ∅
              </div>
              <p
                className="text-foreground-subtle text-xs tracking-widest"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                No listings match your filters
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function isAbortError(error: unknown) {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}
