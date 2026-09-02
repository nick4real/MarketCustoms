import { useState } from "react";
import { useVisitorSession } from "../auth/useVisitorSession";

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

function profileInitials(
  displayName: string,
  email: string | null | undefined,
): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return `${first}${last}`.toUpperCase();
  }
  if (displayName.trim().length >= 2 && !displayName.includes("@")) {
    return displayName.trim().slice(0, 2).toUpperCase();
  }
  const local = email?.split("@")[0];
  if (local) {
    return local.slice(0, 2).toUpperCase();
  }
  return "MC";
}

export default function Profile() {
  const [tab, setTab] = useState<Tab>("listings");
  const { account } = useVisitorSession();
  const displayName = account?.displayName ?? account?.email ?? "Your profile";
  const handle = account?.email ?? "Signed in";
  const initials = profileInitials(displayName, account?.email);

  return (
    <div className="bg-background min-h-screen">
      {/* Cover */}
      <div className="bg-surface relative h-36 overflow-hidden md:h-52">
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=500&fit=crop&auto=format"
          alt="Cover"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="from-background via-background/40 absolute inset-0 bg-linear-to-t to-transparent" />
      </div>

      <div className="px-4 md:px-12 lg:px-16">
        {/* Profile header */}
        <div className="relative z-10 -mt-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end md:-mt-14">
          <div className="border-background bg-card text-foreground-muted flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-lg font-semibold md:h-24 md:w-24">
            {account?.photoUrl ? (
              <img
                src={account.photoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span style={{ fontFamily: "DM Mono, monospace" }}>
                {initials}
              </span>
            )}
          </div>

          <div className="flex-1 sm:pb-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1
                className="text-foreground text-[24px] leading-none font-bold md:text-[28px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                {displayName}
              </h1>
              <span
                className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold tracking-wider"
                style={{
                  fontFamily: "DM Mono, monospace",
                  borderRadius: "2px",
                }}
              >
                VERIFIED
              </span>
            </div>
            <p
              className="text-muted-foreground text-xs"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              {handle}
            </p>
          </div>

          <div className="flex gap-2 self-start sm:gap-3 sm:self-auto sm:pb-1">
            <button
              className="border-border-subtle text-foreground hover:border-border-emphasis border px-4 py-2 text-sm font-medium transition-colors"
              style={{ borderRadius: "2px" }}
            >
              Message
            </button>
            <button
              className="bg-primary text-primary-foreground hover:bg-primary-hover px-4 py-2 text-sm font-semibold transition-colors"
              style={{ borderRadius: "2px" }}
            >
              Follow
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="border-border grid grid-cols-2 gap-5 border-b pb-6 sm:flex sm:items-center sm:gap-10 lg:gap-12">
          {[
            { value: "4.97", label: "Rating", sub: "89 reviews" },
            { value: "142", label: "Sales", sub: "all time" },
            { value: "6", label: "Active", sub: "listings" },
            { value: "98%", label: "Response", sub: "< 2h avg" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-foreground text-[22px] leading-none font-bold md:text-[26px]"
                  style={{ fontFamily: "Fraunces, Georgia, serif" }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-muted-foreground text-xs"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {stat.label}
                </span>
              </div>
              <div
                className="text-foreground-subtle mt-0.5 text-[10px]"
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
              className={`shrink-0 border-b-2 pb-4 text-xs tracking-[0.15em] uppercase transition-colors ${
                tab === t
                  ? "border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground-muted border-transparent"
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
                className="group border-border bg-card hover:border-border-hover cursor-pointer overflow-hidden border transition-all"
                style={{ borderRadius: "2px" }}
              >
                <div className="bg-surface aspect-4/3 overflow-hidden">
                  <img
                    src={`https://images.unsplash.com/${item.image}?w=600&h=450&fit=crop&auto=format`}
                    alt={item.title}
                    className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-foreground text-sm font-medium">
                      {item.title}
                    </h3>
                    <span
                      className="bg-secondary text-muted-foreground ml-2 shrink-0 px-1.5 py-0.5 text-[10px]"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {item.condition}
                    </span>
                  </div>
                  <span
                    className="text-foreground text-xl font-bold"
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
                className="border-border bg-card border p-5 md:p-6"
                style={{ borderRadius: "2px" }}
              >
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary text-foreground-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {r.author[0]}
                    </div>
                    <span className="text-foreground text-sm font-medium">
                      {r.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span
                          key={j}
                          className={`text-sm ${j < r.rating ? "text-primary" : "text-border-subtle"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span
                      className="text-muted-foreground text-xs"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {r.date}
                    </span>
                  </div>
                </div>
                <p className="text-foreground-dim text-sm leading-relaxed font-light">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* About */}
        {tab === "about" && (
          <div className="max-w-lg pb-16">
            <p className="text-foreground-dim mb-5 text-[15px] leading-relaxed font-light">
              Based in Tokyo. I collect and sell considered objects — cameras,
              audio equipment, well-made clothing. Everything I list has been
              part of my own collection. I sell when something has found a
              better home.
            </p>
            <p className="text-foreground-dim text-[15px] leading-relaxed font-light">
              Specialties: vintage photography (Leica, Hasselblad, Nikon),
              Japanese audio, classic outerwear.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
