import { routes } from "@/shared/config";
import { Button, ButtonLink } from "@/shared/ui";
import { TrendingStrip } from "./TrendingStrip";
import { CategoriesStrip } from "./CategoriesStrip";
import { StatsStrip } from "./StatsStrip";

export function HomePage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative flex flex-col lg:min-h-[calc(100vh-56px)] lg:flex-row">
        {/* Text */}
        <div className="flex flex-col justify-center px-6 pt-14 pb-10 md:px-12 lg:max-w-[58%] lg:flex-1 lg:px-16 lg:py-24">
          <div className="mb-6 flex items-center gap-3 lg:mb-8">
            <span className="bg-primary h-px w-6 shrink-0" />
            <span className="text-primary font-mono text-[10px] tracking-[0.2em] uppercase">
              Est. 2024 — The Discerning Market
            </span>
          </div>

          <h1 className="text-foreground font-display mb-7 text-[52px] leading-[0.92] font-black tracking-tight sm:text-[68px] lg:mb-10 lg:text-[84px]">
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
            <ButtonLink
              to={routes.browse}
              size="lg"
              className="md:px-8 md:py-3.5"
            >
              Start Browsing
            </ButtonLink>
            <Button variant="outline" size="lg" className="md:px-8 md:py-3.5">
              List an Item
            </Button>
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
      </section>

      <StatsStrip />
      <CategoriesStrip />
      <TrendingStrip />
    </div>
  );
}
