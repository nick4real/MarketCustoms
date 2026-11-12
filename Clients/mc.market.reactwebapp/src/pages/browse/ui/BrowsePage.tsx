import { useState } from "react";
import { ListingCard } from "@/entities/listing";
import {
  ListingSearchProvider,
  PageSizeSelect,
  SearchPagination,
  SortSelect,
  useListingSearchQuery,
  useListingSearchState,
} from "@/features/listing-search";
import { Button, StatusMessage } from "@/shared/ui";
import { FilterPanel } from "./FilterPanel";

export function BrowsePage() {
  return (
    <ListingSearchProvider>
      <BrowseContent />
    </ListingSearchProvider>
  );
}

function BrowseContent() {
  const listingsQuery = useListingSearchQuery();
  const items = listingsQuery.data?.items ?? [];
  const { applied } = useListingSearchState();

  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const activeFilters =
    (applied.categoryId !== null ? 1 : 0) +
    (applied.condition !== null ? 1 : 0) +
    (applied.searchText !== null ? 1 : 0);

  const subtitle = listingsQuery.isPending
    ? "…"
    : listingsQuery.data
      ? `Page ${listingsQuery.data.pageIndex} of ${Math.max(listingsQuery.data.totalPages, 1)}`
      : "";

  return (
    <div className="bg-background flex">
      {/* Desktop sidebar */}
      <aside className="border-border sticky top-14 hidden h-[calc(100vh-56px)] w-56 shrink-0 self-start overflow-y-auto border-r p-6 md:block">
        <FilterPanel />
      </aside>

      {/* Main */}
      <main className="min-w-0 flex-1">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-4 py-5 md:border-0 md:px-8 md:py-8">
          <div>
            <h1 className="text-foreground font-display text-[26px] leading-none font-bold md:text-[32px]">
              {applied.categoryName ?? "All Listings"}
            </h1>
            <p className="text-muted-foreground mt-1.5 font-mono text-xs">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              type="button"
              className="border-border text-foreground relative flex items-center gap-2 rounded-xs border px-3 py-1.5 font-mono text-sm md:hidden"
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

            <PageSizeSelect />
            <SortSelect />
          </div>
        </div>

        {/* Mobile filter panel (collapsible) */}
        {filtersOpen && (
          <div className="border-border bg-surface-inset border-b px-4 py-6 md:hidden">
            <FilterPanel />
            <Button
              className="mt-4 w-full"
              onClick={() => setFiltersOpen(false)}
            >
              Show results
            </Button>
          </div>
        )}

        {/* Grid */}
        <div className="px-4 py-5 md:px-8 md:py-8">
          {listingsQuery.isPending ? (
            <StatusMessage size="block" message="Loading listings…" />
          ) : listingsQuery.isError ? (
            <StatusMessage size="block" message="Couldn't load listings" />
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <ListingCard key={item.id} listing={item} showLocation />
                ))}
              </div>
              <SearchPagination />
            </>
          ) : (
            <>
              <StatusMessage
                size="block"
                symbol="∅"
                message="No listings match your filters"
              />
              {/* Lets an out-of-range page link get back to real results. */}
              <SearchPagination />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
