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
          className="w-full bg-[#0d0d0d] border border-[#1e1e1e] text-[#f0ece3] text-sm px-3 py-2 pl-8 placeholder-[#3a3532] focus:outline-none focus:border-[#e8820c] transition-colors"
          style={{ borderRadius: "2px", fontFamily: "Outfit, sans-serif" }}
        />
        <svg
          className="absolute left-2.5 top-2.5 text-[#3a3532]"
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
          className="text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-3"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Category
        </h3>
        <div className="flex flex-col gap-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left text-sm px-2 py-1.5 transition-colors ${
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
          className="text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-3"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Condition
        </h3>
        <div className="flex flex-col gap-0.5">
          {conditions.map((cond) => (
            <button
              key={cond}
              onClick={() => setSelectedCondition(cond)}
              className={`text-left text-sm px-2 py-1.5 transition-colors ${
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
          className="text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-3"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Price Range
        </h3>
        <div className="flex gap-2">
          <input
            placeholder="Min"
            className="w-full bg-[#0d0d0d] border border-[#1e1e1e] text-[#f0ece3] text-xs px-2 py-1.5 focus:outline-none focus:border-[#e8820c] transition-colors placeholder-[#3a3532]"
            style={{ borderRadius: "2px", fontFamily: "DM Mono, monospace" }}
          />
          <input
            placeholder="Max"
            className="w-full bg-[#0d0d0d] border border-[#1e1e1e] text-[#f0ece3] text-xs px-2 py-1.5 focus:outline-none focus:border-[#e8820c] transition-colors placeholder-[#3a3532]"
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
      <aside className="hidden md:block w-56 shrink-0 border-r border-[#1e1e1e] p-6 sticky top-14 self-start h-[calc(100vh-56px)] overflow-y-auto">
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
      <main className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 md:px-8 md:py-8 border-b border-[#1e1e1e] md:border-0">
          <div>
            <h1
              className="text-[26px] font-bold text-[#f0ece3] leading-none md:text-[32px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {selectedCategory === "All" ? "All Listings" : selectedCategory}
            </h1>
            <p
              className="text-xs text-[#5a5550] mt-1.5"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {filtered.length} results
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              className="md:hidden flex items-center gap-2 px-3 py-1.5 border border-[#1e1e1e] text-sm text-[#f0ece3] relative"
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
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#e8820c] text-[#080808] text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span
                className="hidden md:block text-xs text-[#5a5550]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Sort
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-[#111] border border-[#1e1e1e] text-[#f0ece3] text-xs md:text-sm px-2 py-1.5 md:px-3 focus:outline-none focus:border-[#e8820c] cursor-pointer"
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
          <div className="md:hidden border-b border-[#1e1e1e] bg-[#0a0a0a] px-4 py-6">
            <FilterPanel
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedCondition={selectedCondition}
              setSelectedCondition={setSelectedCondition}
              search={search}
              setSearch={setSearch}
            />
            <button
              className="mt-4 w-full py-2.5 bg-[#e8820c] text-[#080808] text-sm font-semibold"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <ListingCard key={item.id} listing={item} showLocation />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="text-5xl text-[#2a2a2a] mb-4"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                ∅
              </div>
              <p
                className="text-xs text-[#3a3532] tracking-widest"
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
