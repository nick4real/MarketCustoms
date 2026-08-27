import { Link } from "react-router";

const categories = [
  { name: "Photography", count: 1842, glyph: "◎" },
  { name: "Electronics", count: 3201, glyph: "◈" },
  { name: "Clothing", count: 5644, glyph: "◇" },
  { name: "Home & Living", count: 2890, glyph: "□" },
  { name: "Collectibles", count: 1203, glyph: "◆" },
  { name: "Vintage", count: 4127, glyph: "◉" },
];

const trending = [
  {
    id: 1,
    title: "Leica M6 TTL Black",
    price: 2400,
    condition: "Excellent",
    seller: "K. Nakamura",
    image: "photo-1606983340126-99ab4feaa64a",
  },
  {
    id: 2,
    title: "Arc'teryx Beta AR",
    price: 380,
    condition: "Like New",
    seller: "T. Berg",
    image: "photo-1551698618-1dfe5d97d256",
  },
  {
    id: 3,
    title: "Braun T3 Alarm Clock",
    price: 180,
    condition: "Good",
    seller: "M. Weiss",
    image: "photo-1563861826100-9cb868fdbe1c",
  },
  {
    id: 4,
    title: "Technics SL-1200 MK5",
    price: 1200,
    condition: "Good",
    seller: "D. Okafor",
    image: "photo-1558618666-fcd25c85cd64",
  },
];

export default function Home() {
  return (
    <div className="bg-[#080808]">
      {/* Hero */}
      <section className="relative flex flex-col lg:flex-row lg:min-h-[calc(100vh-56px)]">
        {/* Text */}
        <div className="flex flex-col justify-center px-6 pt-14 pb-10 md:px-12 lg:px-16 lg:py-24 lg:flex-1 lg:max-w-[58%]">
          <div className="flex items-center gap-3 mb-6 lg:mb-8">
            <span className="h-px w-6 bg-[#e8820c] shrink-0" />
            <span
              className="text-[10px] text-[#e8820c] tracking-[0.2em] uppercase"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Est. 2024 — The Discerning Market
            </span>
          </div>

          <h1
            className="text-[52px] leading-[0.92] font-black text-[#f0ece3] mb-7 tracking-tight sm:text-[68px] lg:text-[84px] lg:mb-10"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Trade
            <br />
            Things
            <br />
            Well<span className="text-[#e8820c]">.</span>
          </h1>

          <p className="text-base text-[#5a5550] max-w-md leading-relaxed mb-10 font-light lg:text-[17px] lg:mb-12">
            A marketplace for goods that matter. No noise, no fast fashion —
            only considered objects from sellers who know what they have.
          </p>

          <div className="flex items-center gap-3">
            <Link
              to="/browse"
              className="px-6 py-3 bg-[#e8820c] text-[#080808] text-sm font-semibold tracking-wide hover:bg-[#cf7108] transition-colors md:px-8 md:py-3.5"
              style={{ borderRadius: "2px" }}
            >
              Start Browsing
            </Link>
            <button
              className="px-6 py-3 border border-[#2a2a2a] text-[#f0ece3] text-sm font-medium tracking-wide hover:border-[#4a4540] transition-colors md:px-8 md:py-3.5"
              style={{ borderRadius: "2px" }}
            >
              List an Item
            </button>
          </div>
        </div>

        {/* Desktop image mosaic — hidden on mobile */}
        <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2">
            <div className="row-span-2 bg-[#111] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=900&fit=crop&auto=format"
                alt="Leica M6 camera"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="bg-[#111] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop&auto=format"
                alt="Turntable"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="bg-[#111] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=400&fit=crop&auto=format"
                alt="Jacket"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[#080808] to-transparent z-10 pointer-events-none" />
        </div>

        {/* Mobile image strip — hidden on desktop */}
        <div className="lg:hidden flex gap-2 px-6 pb-10 md:px-12 overflow-x-auto">
          {[
            { src: "photo-1606983340126-99ab4feaa64a", alt: "Camera" },
            { src: "photo-1558618666-fcd25c85cd64", alt: "Turntable" },
            { src: "photo-1551698618-1dfe5d97d256", alt: "Jacket" },
          ].map((img) => (
            <div
              key={img.src}
              className="w-40 h-52 shrink-0 bg-[#111] overflow-hidden"
              style={{ borderRadius: "2px" }}
            >
              <img
                src={`https://images.unsplash.com/${img.src}?w=320&h=416&fit=crop&auto=format`}
                alt={img.alt}
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <div className="border-y border-[#1e1e1e] py-6 px-6 md:px-12 lg:px-16 grid grid-cols-2 gap-5 md:flex md:items-center md:gap-12 lg:gap-16 overflow-x-auto">
        {[
          { value: "48,291", label: "Active listings" },
          { value: "12,847", label: "Verified sellers" },
          { value: "$2.1M", label: "Traded this month" },
          { value: "4.92", label: "Avg seller rating" },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3 shrink-0">
            <span
              className="text-[26px] font-bold text-[#f0ece3] leading-none lg:text-[32px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {stat.value}
            </span>
            <span
              className="text-[10px] text-[#5a5550] tracking-wide"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section className="px-6 py-14 md:px-12 lg:px-16 lg:py-20">
        <div className="flex items-baseline justify-between mb-8 lg:mb-10">
          <h2
            className="text-[28px] font-bold text-[#f0ece3] sm:text-[34px] lg:text-[38px]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Browse by Category
          </h2>
          <Link
            to="/browse"
            className="text-xs text-[#5a5550] hover:text-[#f0ece3] tracking-wide transition-colors shrink-0 ml-4"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            All →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to="/browse"
              className="group border border-[#1e1e1e] bg-[#111] p-4 hover:border-[#e8820c]/50 hover:bg-[#130e09] transition-all duration-200"
              style={{ borderRadius: "2px" }}
            >
              <div className="text-xl text-[#3a3532] mb-3 group-hover:text-[#e8820c] transition-colors">
                {cat.glyph}
              </div>
              <div className="text-sm font-medium text-[#f0ece3] mb-1">
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
      <section className="px-6 py-14 border-t border-[#1e1e1e] md:px-12 lg:px-16 lg:py-20">
        <div className="flex items-end justify-between mb-8 lg:mb-10">
          <div>
            <h2
              className="text-[28px] font-bold text-[#f0ece3] sm:text-[34px] lg:text-[38px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              Trending Now
            </h2>
            <p className="text-[#5a5550] mt-1.5 font-light text-sm">
              High-demand items, moving fast.
            </p>
          </div>
          <Link
            to="/browse"
            className="text-xs text-[#5a5550] hover:text-[#f0ece3] tracking-wide transition-colors shrink-0 ml-4"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trending.map((item) => (
            <div
              key={item.id}
              className="group border border-[#1e1e1e] bg-[#111] overflow-hidden hover:border-[#2a2a2a] transition-all duration-200 cursor-pointer"
              style={{ borderRadius: "2px" }}
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#0d0d0d]">
                <img
                  src={`https://images.unsplash.com/${item.image}?w=600&h=450&fit=crop&auto=format`}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-medium text-[#f0ece3] leading-snug flex-1 pr-2">
                    {item.title}
                  </h3>
                  <span
                    className="text-[10px] text-[#5a5550] bg-[#1a1a1a] px-1.5 py-0.5 shrink-0"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    {item.condition}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span
                    className="text-xl font-bold text-[#f0ece3]"
                    style={{ fontFamily: "Fraunces, Georgia, serif" }}
                  >
                    ${item.price.toLocaleString()}
                  </span>
                  <span
                    className="text-xs text-[#5a5550]"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    {item.seller}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer strip */}
      <div className="border-t border-[#1e1e1e] px-6 py-8 md:px-12 lg:px-16 lg:py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
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
              className="text-xs text-[#3a3532] hover:text-[#5a5550] cursor-pointer transition-colors"
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
