import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  getListingById,
  getRelatedListings,
} from "../api/listings";
import ListingCard from "../components/ListingCard";
import {
  listingImageUrl,
  listingSku,
  sellerInitials,
} from "../models/listing";

function ListingGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const currentImage = images[activeImage] ?? images[0];

  if (!currentImage) {
    return null;
  }

  return (
    <div>
      <div
        className="aspect-[4/3] overflow-hidden bg-[#0d0d0d] border border-[#1e1e1e]"
        style={{ borderRadius: "2px" }}
      >
        <img
          src={listingImageUrl(currentImage, 1200, 900)}
          alt={title}
          className="w-full h-full object-cover opacity-90"
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(index)}
            className={`aspect-[4/3] overflow-hidden bg-[#0d0d0d] border transition-colors ${
              activeImage === index
                ? "border-[#e8820c]"
                : "border-[#1e1e1e] hover:border-[#2e2e2e]"
            }`}
            style={{ borderRadius: "2px" }}
            aria-label={`View photo ${index + 1}`}
          >
            <img
              src={listingImageUrl(image, 400, 300)}
              alt=""
              className="w-full h-full object-cover opacity-80"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ListingDetails() {
  const { listingId } = useParams();
  const listing = getListingById(listingId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [listingId]);

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] bg-[#080808] px-6 text-center">
        <div
          className="text-5xl text-[#2a2a2a] mb-4"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          ∅
        </div>
        <p
          className="text-xs text-[#3a3532] tracking-widest mb-8"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Listing not found
        </p>
        <Link
          to="/browse"
          className="px-6 py-3 bg-[#e8820c] text-[#080808] text-sm font-semibold tracking-wide hover:bg-[#cf7108] transition-colors"
          style={{ borderRadius: "2px" }}
        >
          Back to Browse
        </Link>
      </div>
    );
  }

  const related = getRelatedListings(listing);
  const stockLabel =
    listing.stock === 1 ? "1 available" : `${listing.stock} available`;

  return (
    <div className="bg-[#080808] min-h-[calc(100vh-56px)]">
      <div className="px-6 pt-8 pb-4 md:px-12 lg:px-16">
        <nav
          className="flex flex-wrap items-center gap-2 text-[11px] text-[#5a5550]"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          <Link to="/browse" className="hover:text-[#f0ece3] transition-colors">
            Browse
          </Link>
          <span className="text-[#3a3532]">/</span>
          <Link
            to="/browse"
            className="hover:text-[#f0ece3] transition-colors"
          >
            {listing.category}
          </Link>
          <span className="text-[#3a3532]">/</span>
          <span className="text-[#a09890]">{listing.title}</span>
        </nav>
      </div>

      <div className="px-6 pb-14 md:px-12 lg:px-16 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ListingGallery
            key={listing.id}
            images={listing.images}
            title={listing.title}
          />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="text-[10px] text-[#5a5550] bg-[#1a1a1a] px-1.5 py-0.5"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {listing.condition}
              </span>
              <span
                className="text-[10px] text-[#5a5550]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {listing.category}
              </span>
              <span className="text-[#3a3532]">·</span>
              <span
                className="text-[10px] text-[#5a5550]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {listing.location}
              </span>
            </div>

            <h1
              className="text-[32px] leading-tight font-bold text-[#f0ece3] mb-4 md:text-[40px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {listing.title}
            </h1>

            <div className="flex items-baseline gap-3 mb-8">
              <span
                className="text-[36px] font-bold text-[#f0ece3] leading-none"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                ${listing.price.toLocaleString()}
              </span>
              <span
                className="text-xs text-[#5a5550]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {stockLabel}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                type="button"
                className="px-6 py-3 bg-[#e8820c] text-[#080808] text-sm font-semibold tracking-wide hover:bg-[#cf7108] transition-colors"
                style={{ borderRadius: "2px" }}
              >
                Buy Now
              </button>
              <button
                type="button"
                className="px-6 py-3 border border-[#2a2a2a] text-[#f0ece3] text-sm font-medium tracking-wide hover:border-[#4a4540] transition-colors"
                style={{ borderRadius: "2px" }}
              >
                Make an Offer
              </button>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-3 border border-[#1e1e1e] bg-[#111] p-4 mb-8 hover:border-[#2e2e2e] transition-colors"
              style={{ borderRadius: "2px" }}
            >
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[#a09890] text-xs font-semibold shrink-0">
                {sellerInitials(listing.seller)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-[#f0ece3]">
                  {listing.seller}
                </div>
                <div
                  className="text-[10px] text-[#5a5550]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {listing.sellerRating.toFixed(1)} rating · {listing.sellerSales}{" "}
                  sales · {listing.location}
                </div>
              </div>
              <span
                className="text-xs text-[#5a5550] shrink-0"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Profile →
              </span>
            </Link>

            <section className="mb-8">
              <h2
                className="text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-3"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Description
              </h2>
              <p className="text-sm text-[#a09890] leading-relaxed font-light">
                {listing.description}
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-3"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Details
              </h2>
              <dl className="border-t border-[#1e1e1e]">
                {[
                  { name: "Item ID", value: listingSku(listing.id) },
                  { name: "Listed", value: listing.listedAt },
                  { name: "Condition", value: listing.condition },
                  { name: "Category", value: listing.category },
                  { name: "Ships from", value: listing.location },
                  ...listing.parameters,
                ].map((row) => (
                  <div
                    key={row.name}
                    className="grid grid-cols-2 gap-4 py-3 border-b border-[#1e1e1e]"
                  >
                    <dt
                      className="text-xs text-[#5a5550]"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {row.name}
                    </dt>
                    <dd className="text-sm text-[#f0ece3] text-right">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h2
                className="text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-3"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-[#a09890] border border-[#1e1e1e] bg-[#111] px-2.5 py-1"
                    style={{
                      borderRadius: "2px",
                      fontFamily: "DM Mono, monospace",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 lg:mt-20 pt-12 border-t border-[#1e1e1e]">
            <div className="flex items-end justify-between mb-8">
              <h2
                className="text-[28px] font-bold text-[#f0ece3] sm:text-[32px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                More like this
              </h2>
              <Link
                to="/browse"
                className="text-xs text-[#5a5550] hover:text-[#f0ece3] tracking-wide transition-colors shrink-0 ml-4"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((item) => (
                <ListingCard key={item.id} listing={item} showLocation />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
