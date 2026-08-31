import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getListingById, getRelatedListings } from "../api/listings";
import ListingCard from "../components/ListingCard";
import { listingImageUrl, listingSku, sellerInitials } from "../models/listing";

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
        className="aspect-[4/3] overflow-hidden border border-[#1e1e1e] bg-[#0d0d0d]"
        style={{ borderRadius: "2px" }}
      >
        <img
          src={listingImageUrl(currentImage, 1200, 900)}
          alt={title}
          className="h-full w-full object-cover opacity-90"
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(index)}
            className={`aspect-[4/3] overflow-hidden border bg-[#0d0d0d] transition-colors ${
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
              className="h-full w-full object-cover opacity-80"
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
      <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center bg-[#080808] px-6 text-center">
        <div
          className="mb-4 text-5xl text-[#2a2a2a]"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          ∅
        </div>
        <p
          className="mb-8 text-xs tracking-widest text-[#3a3532]"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Listing not found
        </p>
        <Link
          to="/browse"
          className="bg-[#e8820c] px-6 py-3 text-sm font-semibold tracking-wide text-[#080808] transition-colors hover:bg-[#cf7108]"
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
    <div className="min-h-[calc(100vh-56px)] bg-[#080808]">
      <div className="px-6 pt-8 pb-4 md:px-12 lg:px-16">
        <nav
          className="flex flex-wrap items-center gap-2 text-[11px] text-[#5a5550]"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          <Link to="/browse" className="transition-colors hover:text-[#f0ece3]">
            Browse
          </Link>
          <span className="text-[#3a3532]">/</span>
          <Link to="/browse" className="transition-colors hover:text-[#f0ece3]">
            {listing.category}
          </Link>
          <span className="text-[#3a3532]">/</span>
          <span className="text-[#a09890]">{listing.title}</span>
        </nav>
      </div>

      <div className="px-6 pb-14 md:px-12 lg:px-16 lg:pb-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <ListingGallery
            key={listing.id}
            images={listing.images}
            title={listing.title}
          />

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className="bg-[#1a1a1a] px-1.5 py-0.5 text-[10px] text-[#5a5550]"
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
              className="mb-4 text-[32px] leading-tight font-bold text-[#f0ece3] md:text-[40px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {listing.title}
            </h1>

            <div className="mb-8 flex items-baseline gap-3">
              <span
                className="text-[36px] leading-none font-bold text-[#f0ece3]"
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

            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="bg-[#e8820c] px-6 py-3 text-sm font-semibold tracking-wide text-[#080808] transition-colors hover:bg-[#cf7108]"
                style={{ borderRadius: "2px" }}
              >
                Buy Now
              </button>
              <button
                type="button"
                className="border border-[#2a2a2a] px-6 py-3 text-sm font-medium tracking-wide text-[#f0ece3] transition-colors hover:border-[#4a4540]"
                style={{ borderRadius: "2px" }}
              >
                Make an Offer
              </button>
            </div>

            <Link
              to="/profile"
              className="mb-8 flex items-center gap-3 border border-[#1e1e1e] bg-[#111] p-4 transition-colors hover:border-[#2e2e2e]"
              style={{ borderRadius: "2px" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-semibold text-[#a09890]">
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
                  {listing.sellerRating.toFixed(1)} rating ·{" "}
                  {listing.sellerSales} sales · {listing.location}
                </div>
              </div>
              <span
                className="shrink-0 text-xs text-[#5a5550]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Profile →
              </span>
            </Link>

            <section className="mb-8">
              <h2
                className="mb-3 text-[10px] tracking-[0.15em] text-[#5a5550] uppercase"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Description
              </h2>
              <p className="text-sm leading-relaxed font-light text-[#a09890]">
                {listing.description}
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="mb-3 text-[10px] tracking-[0.15em] text-[#5a5550] uppercase"
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
                    className="grid grid-cols-2 gap-4 border-b border-[#1e1e1e] py-3"
                  >
                    <dt
                      className="text-xs text-[#5a5550]"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {row.name}
                    </dt>
                    <dd className="text-right text-sm text-[#f0ece3]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h2
                className="mb-3 text-[10px] tracking-[0.15em] text-[#5a5550] uppercase"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-[#1e1e1e] bg-[#111] px-2.5 py-1 text-[11px] text-[#a09890]"
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
          <section className="mt-16 border-t border-[#1e1e1e] pt-12 lg:mt-20">
            <div className="mb-8 flex items-end justify-between">
              <h2
                className="text-[28px] font-bold text-[#f0ece3] sm:text-[32px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                More like this
              </h2>
              <Link
                to="/browse"
                className="ml-4 shrink-0 text-xs tracking-wide text-[#5a5550] transition-colors hover:text-[#f0ece3]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
