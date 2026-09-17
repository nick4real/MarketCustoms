import { getListings, ListingCard, type ListingView } from "@/entities/listing";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function TrendingStrip() {
  const [trendingStatus, setTrendingStatus] = useState<
    "loading" | "ready" | "empty" | "error"
  >("loading");
  const [trending, setTrending] = useState<ListingView[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    // TODO: Get trending listings from the API
    void getListings({ pageSize: 4 }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) {
          return;
        }
        setTrending(response.items);
        setTrendingStatus(response.items.length === 0 ? "empty" : "ready");
      })
      .catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError") ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }
        setTrending([]);
        setTrendingStatus("error");
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      {trendingStatus !== "empty" && (
        <section className="border-border border-t px-6 py-14 md:px-12 lg:px-16 lg:py-20">
          <div className="mb-8 flex items-end justify-between lg:mb-10">
            <div>
              <h2
                className="text-foreground text-[28px] font-bold sm:text-[34px] lg:text-[38px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Trending Now
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm font-light">
                High-demand items, moving fast.
              </p>
            </div>
            <Link
              to="/browse"
              className="text-muted-foreground hover:text-foreground ml-4 shrink-0 text-xs tracking-wide transition-colors"
              style={{ fontFamily: "DM Mono, monospace" }}
            >
              See all →
            </Link>
          </div>

          {trendingStatus === "loading" ? (
            <p className="text-muted-foreground text-sm font-light">
              Loading trending listings…
            </p>
          ) : trendingStatus === "error" ? (
            <p className="text-muted-foreground text-sm font-light">
              Couldn't load trending listings
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trending.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
