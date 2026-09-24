import { useState } from "react";
import {
  ListingCard,
  ListingStoreProvider,
  useListingStoreState,
  useListingsQuery,
} from "@/entities/listing";
import { FilterPanel } from "@/widgets/filter-panel";
import { SortDropdownButton } from "@/features/listing-sorters";

export default function Browse() {
  return (
    <ListingStoreProvider>
      <BrowseContent />
    </ListingStoreProvider>
  );
}

export function BrowseContent() {
  const listingsQuery = useListingsQuery();
  const items = listingsQuery.data?.items ?? [];
  const {
    selectedCategoryId,
    selectedCategoryName,
    selectedCondition,
    selectedSort,
    searchText,
    actions: { setSelectedSort },
  } = useListingStoreState();

  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const activeFilters =
    (selectedCategoryId !== null ? 1 : 0) +
    (selectedCondition !== null ? 1 : 0) +
    (searchText !== null ? 1 : 0);

  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="border-border sticky top-14 hidden h-[calc(100vh-56px)] w-56 shrink-0 self-start overflow-y-auto border-r p-6 md:block">
        <FilterPanel />
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
              {listingsQuery.isPending ? "…" : `${items.length} results`}
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

            <SortDropdownButton
              sort={selectedSort ?? "newest"}
              setSort={(sort) => setSelectedSort(sort)}
            />
          </div>
        </div>

        {/* Mobile filter panel (collapsible) */}
        {filtersOpen && (
          <div className="border-border bg-surface-inset border-b px-4 py-6 md:hidden">
            <FilterPanel />
            <button
              className="bg-primary text-primary-foreground mt-4 w-full py-2.5 text-sm font-semibold"
              style={{ borderRadius: "2px" }}
              onClick={() => setFiltersOpen(false)}
            >
              Show {items.length} results
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="px-4 py-5 md:px-8 md:py-8">
          {listingsQuery.isPending ? (
            <p
              className="text-foreground-subtle py-24 text-center text-xs tracking-widest"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Loading listings…
            </p>
          ) : listingsQuery.isError ? (
            <p
              className="text-foreground-subtle py-24 text-center text-xs tracking-widest"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Couldn&apos;t load listings
            </p>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
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
