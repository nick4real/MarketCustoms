import { Link } from "react-router";
import { SiteFooter } from "@/widgets/footer";
import { TrendingStrip } from "@/widgets/trending-strip";
import { CategoriesTopicsStrip } from "@/widgets/categories-topics-strip";
import { SiteStatisticsStrip } from "@/widgets/stats-strip";

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative flex flex-col lg:min-h-[calc(100vh-56px)] lg:flex-row">
        {/* Text */}
        <div className="flex flex-col justify-center px-6 pt-14 pb-10 md:px-12 lg:max-w-[58%] lg:flex-1 lg:px-16 lg:py-24">
          <div className="mb-6 flex items-center gap-3 lg:mb-8">
            <span className="bg-primary h-px w-6 shrink-0" />
            <span
              className="text-primary text-[10px] tracking-[0.2em] uppercase"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              Est. 2024 — The Discerning Market
            </span>
          </div>

          <h1
            className="text-foreground mb-7 text-[52px] leading-[0.92] font-black tracking-tight sm:text-[68px] lg:mb-10 lg:text-[84px]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Trade
            <br />
            Things
            <br />
            Well<span className="text-primary">.</span>
          </h1>

          <p className="text-muted-foreground mb-10 max-w-md text-base leading-relaxed font-light lg:mb-12 lg:text-[17px]">
            A marketplace for goods that matter. No noise, no fast fashion —
            only considered objects from sellers who know what they have.
          </p>

          <div className="flex items-center gap-3">
            <Link
              to="/browse"
              className="bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-3 text-sm font-semibold tracking-wide transition-colors md:px-8 md:py-3.5"
              style={{ borderRadius: "2px" }}
            >
              Start Browsing
            </Link>
            <button
              className="border-border-subtle text-foreground hover:border-border-emphasis border px-6 py-3 text-sm font-medium tracking-wide transition-colors md:px-8 md:py-3.5"
              style={{ borderRadius: "2px" }}
            >
              List an Item
            </button>
          </div>
        </div>

        {/* Desktop image mosaic — hidden on mobile */}
        <div className="relative hidden overflow-hidden lg:block lg:flex-1">
          <div className="absolute inset-0 grid grid-cols-2 gap-2 p-2">
            <div className="bg-card row-span-2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=900&fit=crop&auto=format"
                alt="Leica M6 camera"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <div className="bg-card overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop&auto=format"
                alt="Turntable"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
            <div className="bg-card overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=400&fit=crop&auto=format"
                alt="Jacket"
                className="h-full w-full object-cover opacity-80"
              />
            </div>
          </div>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-linear-to-r to-transparent" />
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
              className="bg-card h-52 w-40 shrink-0 overflow-hidden"
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

      <SiteStatisticsStrip />
      <CategoriesTopicsStrip />
      <TrendingStrip />
      <SiteFooter />
    </div>
  );
}
