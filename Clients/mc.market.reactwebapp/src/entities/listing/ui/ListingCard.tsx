import { Link } from "react-router";
import { cx } from "@/shared/lib";
import { listingImageUrl } from "../lib/listingImageUrl";
import type { ListingView } from "../model/types";
import { ConditionBadge } from "./ConditionBadge";

export function ListingCard({
  listing,
  showLocation = false,
}: {
  listing: ListingView;
  showLocation?: boolean;
}) {
  const coverImage = listing.imageId;

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group border-border bg-card hover:border-border-hover overflow-hidden rounded-xs border transition-all duration-200"
    >
      <div className="bg-surface aspect-4/3 overflow-hidden">
        {coverImage ? (
          <img
            src={listingImageUrl(coverImage, 600, 450)}
            alt={listing.title}
            className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="p-4">
        <div className="mb-1.5 flex items-start justify-between">
          <h3 className="text-foreground flex-1 pr-2 text-sm leading-snug font-medium">
            {listing.title}
          </h3>
          <ConditionBadge condition={listing.condition} />
        </div>
        {showLocation && (
          <div className="text-foreground-subtle mb-3 font-mono text-[10px]">
            {"—"}
          </div>
        )}
        <div
          className={cx(
            "flex items-center justify-between",
            !showLocation && "mt-3",
          )}
        >
          <span className="text-foreground font-display text-xl font-bold">
            ${listing.price.toLocaleString()}
          </span>
          <span className="text-muted-foreground font-mono text-xs">{"—"}</span>
        </div>
      </div>
    </Link>
  );
}
