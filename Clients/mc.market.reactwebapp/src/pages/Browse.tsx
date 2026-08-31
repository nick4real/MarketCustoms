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
          className="w-full border border-[#1e1e1e] bg-[#0d0d0d] px-3 py-2 pl-8 text-sm text-[#f0ece3] placeholder-[#3a3532] transition-colors focus:border-[#e8820c] focus:outline-none"
          style={{ borderRadius: "2px", fontFamily: "Outfit, sans-serif" }}
        />
        <svg
          className="absolute top-2.5 left-2.5 text-[#3a3532]"
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
          className="mb-3 text-[10px] tracking-[0.15em] text-[#5a5550] uppercase"
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
                  ? "text-[#e8820c]"
                  : "text-[#5a5550] hover:text-[#a09890]"
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
          className="mb-3 text-[10px] tracking-[0.15em] text-[#5a5550] uppercase"
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
                  ? "text-[#e8820c]"
                  : "text-[#5a5550] hover:text-[#a09890]"
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
          className="mb-3 text-[10px] tracking-[0.15em] text-[#5a5550] uppercase"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Price Range
        </h3>
        <div className="flex gap-2">
          <input
            placeholder="Min"
            className="w-full border border-[#1e1e1e] bg-[#0d0d0d] px-2 py-1.5 text-xs text-[#f0ece3] placeholder-[#3a3532] transition-colors focus:border-[#e8820c] focus:outline-none"
            style={{ borderRadius: "2px", fontFamily: "DM Mono, monospace" }}
          />
          <input
            placeholder="Max"
            className="w-full border border-[#1e1e1e] bg-[#0d0d0d] px-2 py-1.5 text-xs text-[#f0ece3] placeholder-[#3a3532] transition-colors focus:border-[#e8820c] focus:outline-none"
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
    <div className="flex min-h-screen bg-[#080808]">
      {/* Desktop sidebar */}
      <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-56 shrink-0 self-start overflow-y-auto border-r border-[#1e1e1e] p-6 md:block">
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
        <div className="flex items-center justify-between border-b border-[#1e1e1e] px-4 py-5 md:border-0 md:px-8 md:py-8">
          <div>
            <h1
              className="text-[26px] leading-none font-bold text-[#f0ece3] md:text-[32px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {selectedCategory === "All" ? "All Listings" : selectedCategory}
            </h1>
            <p
              className="mt-1.5 text-xs text-[#5a5550]"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {filtered.length} results
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              className="relative flex items-center gap-2 border border-[#1e1e1e] px-3 py-1.5 text-sm text-[#f0ece3] md:hidden"
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
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#e8820c] text-[9px] font-bold text-[#080808]">
                  {activeFilters}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span
                className="hidden text-xs text-[#5a5550] md:block"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Sort
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="cursor-pointer border border-[#1e1e1e] bg-[#111] px-2 py-1.5 text-xs text-[#f0ece3] focus:border-[#e8820c] focus:outline-none md:px-3 md:text-sm"
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
          <div className="border-b border-[#1e1e1e] bg-[#0a0a0a] px-4 py-6 md:hidden">
            <FilterPanel
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedCondition={selectedCondition}
              setSelectedCondition={setSelectedCondition}
              search={search}
              setSearch={setSearch}
            />
            <button
              className="mt-4 w-full bg-[#e8820c] py-2.5 text-sm font-semibold text-[#080808]"
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
                className="mb-4 text-5xl text-[#2a2a2a]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                ∅
              </div>
              <p
                className="text-xs tracking-widest text-[#3a3532]"
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
