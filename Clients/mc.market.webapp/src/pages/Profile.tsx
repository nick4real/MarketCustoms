import { useState } from "react";

const listings = [
  {
    id: 1,
    title: "Rolleiflex 2.8F",
    price: 1650,
    image: "photo-1471341971476-ae15ff5dd4ea",
    condition: "Excellent",
  },
  {
    id: 2,
    title: "Barbour Beaufort Jacket",
    price: 290,
    image: "photo-1544441893-675973e31985",
    condition: "Good",
  },
  {
    id: 3,
    title: "Braun LE1 Speakers",
    price: 480,
    image: "photo-1545454675-3531b543be5d",
    condition: "Good",
  },
  {
    id: 4,
    title: "Patagonia Baggies 1990",
    price: 75,
    image: "photo-1473966968600-fa801b869a1a",
    condition: "Vintage",
  },
  {
    id: 5,
    title: "Nikon FM2 Chrome",
    price: 420,
    image: "photo-1516035069371-29a1b244cc32",
    condition: "Excellent",
  },
  {
    id: 6,
    title: "Muji Stationery Set",
    price: 55,
    image: "photo-1517971071642-34a2d3ecc9cd",
    condition: "New",
  },
];

const reviews = [
  {
    author: "T. Berg",
    rating: 5,
    date: "Aug 14, 2026",
    text: "Impeccably packed, exactly as described. Would buy from again without hesitation.",
  },
  {
    author: "M. Weiss",
    rating: 5,
    date: "Jul 28, 2026",
    text: "Fast response, honest about condition, item arrived better than expected.",
  },
  {
    author: "L. Chen",
    rating: 4,
    date: "Jul 02, 2026",
    text: "Good seller, slight delay in shipping but communicated proactively. Item was perfect.",
  },
];

type Tab = "listings" | "reviews" | "about";

export default function Profile() {
  const [tab, setTab] = useState<Tab>("listings");

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Cover */}
      <div className="relative h-36 overflow-hidden bg-[#0d0d0d] md:h-52">
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=500&fit=crop&auto=format"
          alt="Cover"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent" />
      </div>

      <div className="px-4 md:px-12 lg:px-16">
        {/* Profile header */}
        <div className="relative z-10 -mt-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end md:-mt-14">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-[#080808] bg-[#111] md:h-24 md:w-24">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format"
              alt="Jordan Nakamura"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 sm:pb-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1
                className="text-[24px] leading-none font-bold text-[#f0ece3] md:text-[28px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Jordan Nakamura
              </h1>
              <span
                className="bg-[#e8820c] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#080808]"
                style={{
                  fontFamily: "DM Mono, monospace",
                  borderRadius: "2px",
                }}
              >
                VERIFIED
              </span>
            </div>
            <p
              className="text-xs text-[#5a5550]"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              @j.nakamura · Since March 2024 · Tokyo, JP
            </p>
          </div>

          <div className="flex gap-2 self-start sm:gap-3 sm:self-auto sm:pb-1">
            <button
              className="border border-[#2a2a2a] px-4 py-2 text-sm font-medium text-[#f0ece3] transition-colors hover:border-[#4a4540]"
              style={{ borderRadius: "2px" }}
            >
              Message
            </button>
            <button
              className="bg-[#e8820c] px-4 py-2 text-sm font-semibold text-[#080808] transition-colors hover:bg-[#cf7108]"
              style={{ borderRadius: "2px" }}
            >
              Follow
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-5 border-b border-[#1e1e1e] pb-6 sm:flex sm:items-center sm:gap-10 lg:gap-12">
          {[
            { value: "4.97", label: "Rating", sub: "89 reviews" },
            { value: "142", label: "Sales", sub: "all time" },
            { value: "6", label: "Active", sub: "listings" },
            { value: "98%", label: "Response", sub: "< 2h avg" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[22px] leading-none font-bold text-[#f0ece3] md:text-[26px]"
                  style={{ fontFamily: "Fraunces, Georgia, serif" }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs text-[#5a5550]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {stat.label}
                </span>
              </div>
              <div
                className="mt-0.5 text-[10px] text-[#3a3532]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-8 overflow-x-auto pt-5">
          {(["listings", "reviews", "about"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 border-b-2 pb-4 text-xs tracking-[0.15em] capitalize uppercase transition-colors ${
                tab === t
                  ? "border-[#e8820c] text-[#f0ece3]"
                  : "border-transparent text-[#5a5550] hover:text-[#a09890]"
              }`}
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Listings */}
        {tab === "listings" && (
          <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer overflow-hidden border border-[#1e1e1e] bg-[#111] transition-all hover:border-[#2e2e2e]"
                style={{ borderRadius: "2px" }}
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#0d0d0d]">
                  <img
                    src={`https://images.unsplash.com/${item.image}?w=600&h=450&fit=crop&auto=format`}
                    alt={item.title}
                    className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-sm font-medium text-[#f0ece3]">
                      {item.title}
                    </h3>
                    <span
                      className="ml-2 shrink-0 bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] text-[#5a5550]"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {item.condition}
                    </span>
                  </div>
                  <span
                    className="text-xl font-bold text-[#f0ece3]"
                    style={{ fontFamily: "Fraunces, Georgia, serif" }}
                  >
                    ${item.price.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reviews */}
        {tab === "reviews" && (
          <div className="max-w-2xl space-y-4 pb-16">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="border border-[#1e1e1e] bg-[#111] p-5 md:p-6"
                style={{ borderRadius: "2px" }}
              >
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-semibold text-[#a09890]">
                      {r.author[0]}
                    </div>
                    <span className="text-sm font-medium text-[#f0ece3]">
                      {r.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span
                          key={j}
                          className={`text-sm ${j < r.rating ? "text-[#e8820c]" : "text-[#2a2a2a]"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span
                      className="text-xs text-[#5a5550]"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {r.date}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed font-light text-[#7a7570]">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* About */}
        {tab === "about" && (
          <div className="max-w-lg pb-16">
            <p className="mb-5 text-[15px] leading-relaxed font-light text-[#7a7570]">
              Based in Tokyo. I collect and sell considered objects — cameras,
              audio equipment, well-made clothing. Everything I list has been
              part of my own collection. I sell when something has found a
              better home.
            </p>
            <p className="text-[15px] leading-relaxed font-light text-[#7a7570]">
              Specialties: vintage photography (Leica, Hasselblad, Nikon),
              Japanese audio, classic outerwear.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
