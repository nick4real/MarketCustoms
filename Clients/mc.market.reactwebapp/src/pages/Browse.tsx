import { useState } from "react";
import { listings } from "../api/listings";
import ListingCard from "../components/ListingCard";

const categories = [
  "All",
  "Photography",
  "Electronics",
  "Clothing",
  "Home",
  "Beauty",
  "Collectibles",
  "Vintage",
];
const conditions = ["Any", "New", "Like New", "Excellent", "Good", "Vintage"];

function FilterPanel({
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  search,
  setSearch,
}: {
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
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
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1.5 text-left text-sm transition-colors ${
                selectedCategory === cat
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground-muted"
              }`}
              style={{ borderRadius: "2px" }}
            >
              {cat}
            </button>
          ))}
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("Any");
  const [sort, setSort] = useState("Recent");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = listings.filter((p) => {
    const matchCat =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchCond =
      selectedCondition === "Any" || p.condition === selectedCondition;
    const matchSearch =
      !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchCond && matchSearch;
  });

  const activeFilters =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedCondition !== "Any" ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="bg-background flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="border-border sticky top-14 hidden h-[calc(100vh-56px)] w-56 shrink-0 self-start overflow-y-auto border-r p-6 md:block">
        <FilterPanel
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
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
              {selectedCategory === "All" ? "All Listings" : selectedCategory}
            </h1>
            <p
              className="text-muted-foreground mt-1.5 text-xs"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {filtered.length} results
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
                onChange={(e) => setSort(e.target.value)}
                className="border-border bg-card text-foreground focus:border-primary cursor-pointer border px-2 py-1.5 text-xs focus:outline-none md:px-3 md:text-sm"
                style={{
                  borderRadius: "2px",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                <option>Recent</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile filter panel (collapsible) */}
        {filtersOpen && (
          <div className="border-border bg-surface-inset border-b px-4 py-6 md:hidden">
            <FilterPanel
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
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
          {filtered.length > 0 ? (
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
