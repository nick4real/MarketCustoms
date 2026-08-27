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
      className="group border border-[#1e1e1e] bg-[#111] overflow-hidden hover:border-[#2e2e2e] transition-all duration-200"
      style={{ borderRadius: "2px" }}
    >
      <div className="aspect-[4/3] overflow-hidden bg-[#0d0d0d]">
        <img
          src={listingImageUrl(coverImage, 600, 450)}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="text-sm font-medium text-[#f0ece3] leading-snug flex-1 pr-2">
            {listing.title}
          </h3>
          <span
            className="text-[10px] text-[#5a5550] bg-[#1a1a1a] px-1.5 py-0.5 shrink-0"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {listing.condition}
          </span>
        </div>
        {showLocation && (
          <div
            className="text-[10px] text-[#3a3532] mb-3"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {listing.location}
          </div>
        )}
        <div
          className={`flex items-center justify-between ${showLocation ? "" : "mt-3"}`}
        >
          <span
            className="text-xl font-bold text-[#f0ece3]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            ${listing.price.toLocaleString()}
          </span>
          <span
            className="text-xs text-[#5a5550]"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {listing.seller}
          </span>
        </div>
      </div>
    </Link>
  );
}
