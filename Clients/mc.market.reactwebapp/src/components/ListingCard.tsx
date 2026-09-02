import { Link } from "react-router";
import type { Listing } from "../models/listing";
import { listingImageUrl } from "../models/listing";

export default function ListingCard({
  listing,
  showLocation = false,
}: {
  listing: Listing;
  showLocation?: boolean;
}) {
  const coverImage = listing.images[0];
  if (!coverImage) {
    return null;
  }

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="group border-border bg-card hover:border-border-hover overflow-hidden border transition-all duration-200"
      style={{ borderRadius: "2px" }}
    >
      <div className="bg-surface aspect-4/3 overflow-hidden">
        <img
          src={listingImageUrl(coverImage, 600, 450)}
          alt={listing.title}
          className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="mb-1.5 flex items-start justify-between">
          <h3 className="text-foreground flex-1 pr-2 text-sm leading-snug font-medium">
            {listing.title}
          </h3>
          <span
            className="bg-secondary text-muted-foreground shrink-0 px-1.5 py-0.5 text-[10px]"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {listing.condition}
          </span>
        </div>
        {showLocation && (
          <div
            className="text-foreground-subtle mb-3 text-[10px]"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {listing.location}
          </div>
        )}
        <div
          className={`flex items-center justify-between ${showLocation ? "" : "mt-3"}`}
        >
          <span
            className="text-foreground text-xl font-bold"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            ${listing.price.toLocaleString()}
          </span>
          <span
            className="text-muted-foreground text-xs"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {listing.seller}
          </span>
        </div>
      </div>
    </Link>
  );
}
