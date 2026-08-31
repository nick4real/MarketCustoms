import { Link } from "react-router";
import { getTrendingListings } from "../api/listings";
import ListingCard from "../components/ListingCard";

const categories = [
  { name: "Photography", count: 1842, glyph: "◎" },
  { name: "Electronics", count: 3201, glyph: "◈" },
  { name: "Clothing", count: 5644, glyph: "◇" },
  { name: "Home & Living", count: 2890, glyph: "□" },
  { name: "Collectibles", count: 1203, glyph: "◆" },
  { name: "Vintage", count: 4127, glyph: "◉" },
];

const trending = getTrendingListings();

export default function Home() {
  return (
    <div className="bg-[#080808]">
      {/* Hero */}
      <section className="relative flex flex-col lg:min-h-[calc(100vh-56px)] lg:flex-row">
        {/* Text */}
        <div className="flex flex-col justify-center px-6 pt-14 pb-10 md:px-12 lg:max-w-[58%] lg:flex-1 lg:px-16 lg:py-24">
          <div className="mb-6 flex items-center gap-3 lg:mb-8">
            <span className="h-px w-6 shrink-0 bg-[#e8820c]" />
            <span
              className="text-[10px] tracking-[0.2em] text-[#e8820c] uppercase"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Est. 2024 — The Discerning Market
            </span>
          </div>

          <h1
            className="mb-7 text-[52px] leading-[0.92] font-black tracking-tight text-[#f0ece3] sm:text-[68px] lg:mb-10 lg:text-[84px]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Trade
            <br />
            Things
            <br />
            Well<span className="text-[#e8820c]">.</span>
          </h1>

          <p className="mb-10 max-w-md text-base leading-relaxed font-light text-[#5a5550] lg:mb-12 lg:text-[17px]">
            A marketplace for goods that matter. No noise, no fast fashion —
            only considered objects from sellers who know what they have.
          </p>

          <div className="flex items-center gap-3">
            <Link
              to="/browse"
              className="bg-[#e8820c] px-6 py-3 text-sm font-semibold tracking-wide text-[#080808] transition-colors hover:bg-[#cf7108] md:px-8 md:py-3.5"
              style={{ borderRadius: "2px" }}
            >
              Start Browsing
            </Link>
            <button
              className="border border-[#2a2a2a] px-6 py-3 text-sm font-medium tracking-wide text-[#f0ece3] transition-colors hover:border-[#4a4540] md:px-8 md:py-3.5"
              style={{ borderRadius: "2px" }}
            >
              List an Item
            </button>
          </div>
        </div>

        {/* Desktop image mosaic — hidden on mobile */}
        <div className="relative hidden overflow-hidden lg:block lg:flex-1">
          <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2">
            <div className="row-span-2 overflow-hidden bg-[#111]">
              <img
                src="https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=900&fit=crop&auto=format"
                alt="Leica M6 camera"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <div className="overflow-hidden bg-[#111]">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop&auto=format"
                alt="Turntable"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <div className="overflow-hidden bg-[#111]">
              <img
                src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=400&fit=crop&auto=format"
                alt="Jacket"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#080808] to-transparent" />
        </div>

        {/* Mobile image strip — hidden on desktop */}
        <div className="flex gap-2 overflow-x-auto px-6 pb-10 md:px-12 lg:hidden">
          {[
            { src: "photo-1606983340126-99ab4feaa64a", alt: "Camera" },
            { src: "photo-1558618666-fcd25c85cd64", alt: "Turntable" },
            { src: "photo-1551698618-1dfe5d97d256", alt: "Jacket" },
          ].map((img) => (
            <div
              key={img.src}
              className="h-52 w-40 shrink-0 overflow-hidden bg-[#111]"
              style={{ borderRadius: "2px" }}
            >
              <img
                src={`https://images.unsplash.com/${img.src}?w=320&h=416&fit=crop&auto=format`}
                alt={img.alt}
                className="h-full w-full object-cover opacity-80"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-5 overflow-x-auto border-y border-[#1e1e1e] px-6 py-6 md:flex md:items-center md:gap-12 md:px-12 lg:gap-16 lg:px-16">
        {[
          { value: "48,291", label: "Active listings" },
          { value: "12,847", label: "Verified sellers" },
          { value: "$2.1M", label: "Traded this month" },
          { value: "4.92", label: "Avg seller rating" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex shrink-0 flex-col gap-1 md:flex-row md:items-baseline md:gap-3"
          >
            <span
              className="text-[26px] leading-none font-bold text-[#f0ece3] lg:text-[32px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {stat.value}
            </span>
            <span
              className="text-[10px] tracking-wide text-[#5a5550]"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section className="px-6 py-14 md:px-12 lg:px-16 lg:py-20">
        <div className="mb-8 flex items-baseline justify-between lg:mb-10">
          <h2
            className="text-[28px] font-bold text-[#f0ece3] sm:text-[34px] lg:text-[38px]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Browse by Category
          </h2>
          <Link
            to="/browse"
            className="ml-4 shrink-0 text-xs tracking-wide text-[#5a5550] transition-colors hover:text-[#f0ece3]"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            All →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to="/browse"
              className="group border border-[#1e1e1e] bg-[#111] p-4 transition-all duration-200 hover:border-[#e8820c]/50 hover:bg-[#130e09]"
              style={{ borderRadius: "2px" }}
            >
              <div className="mb-3 text-xl text-[#3a3532] transition-colors group-hover:text-[#e8820c]">
                {cat.glyph}
              </div>
              <div className="mb-1 text-sm font-medium text-[#f0ece3]">
                {cat.name}
              </div>
              <div
                className="text-[10px] text-[#5a5550]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {cat.count.toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="border-t border-[#1e1e1e] px-6 py-14 md:px-12 lg:px-16 lg:py-20">
        <div className="mb-8 flex items-end justify-between lg:mb-10">
          <div>
            <h2
              className="text-[28px] font-bold text-[#f0ece3] sm:text-[34px] lg:text-[38px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Trending Now
            </h2>
            <p className="mt-1.5 text-sm font-light text-[#5a5550]">
              High-demand items, moving fast.
            </p>
          </div>
          <Link
            to="/browse"
            className="ml-4 shrink-0 text-xs tracking-wide text-[#5a5550] transition-colors hover:text-[#f0ece3]"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      </section>

      {/* Footer strip */}
      <div className="flex flex-col gap-6 border-t border-[#1e1e1e] px-6 py-8 sm:flex-row sm:items-center sm:justify-between md:px-12 lg:px-16 lg:py-10">
        <span
          className="text-2xl font-black text-[#f0ece3]"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          MKT<span className="text-[#e8820c]">.</span>
        </span>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {["About", "Sell", "Support", "Terms", "Privacy"].map((l) => (
            <span
              key={l}
              className="cursor-pointer text-xs text-[#3a3532] transition-colors hover:text-[#5a5550]"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {l}
            </span>
          ))}
        </div>
        <span
          className="text-[11px] text-[#3a3532]"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          © 2026 MKT.
        </span>
      </div>
    </div>
  );
}
