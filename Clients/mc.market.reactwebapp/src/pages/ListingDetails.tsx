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
        className="border-border bg-surface aspect-4/3 overflow-hidden border"
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
            className={`bg-surface aspect-4/3 overflow-hidden border transition-colors ${
              activeImage === index
                ? "border-primary"
                : "border-border hover:border-border-hover"
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
      <div className="bg-background flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 text-center">
        <div
          className="text-border-subtle mb-4 text-5xl"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          ∅
        </div>
        <p
          className="text-foreground-subtle mb-8 text-xs tracking-widest"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          Listing not found
        </p>
        <Link
          to="/browse"
          className="bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-3 text-sm font-semibold tracking-wide transition-colors"
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
    <div className="bg-background min-h-[calc(100vh-56px)]">
      <div className="px-6 pt-8 pb-4 md:px-12 lg:px-16">
        <nav
          className="text-muted-foreground flex flex-wrap items-center gap-2 text-[11px]"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          <Link
            to="/browse"
            className="hover:text-foreground transition-colors"
          >
            Browse
          </Link>
          <span className="text-foreground-subtle">/</span>
          <Link
            to="/browse"
            className="hover:text-foreground transition-colors"
          >
            {listing.category}
          </Link>
          <span className="text-foreground-subtle">/</span>
          <span className="text-foreground-muted">{listing.title}</span>
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
                className="bg-secondary text-muted-foreground px-1.5 py-0.5 text-[10px]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {listing.condition}
              </span>
              <span
                className="text-muted-foreground text-[10px]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {listing.category}
              </span>
              <span className="text-foreground-subtle">·</span>
              <span
                className="text-muted-foreground text-[10px]"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {listing.location}
              </span>
            </div>

            <h1
              className="text-foreground mb-4 text-[32px] leading-tight font-bold md:text-[40px]"
              style={{ fontFamily: "Fraunces, Georgia, serif" }}
            >
              {listing.title}
            </h1>

            <div className="mb-8 flex items-baseline gap-3">
              <span
                className="text-foreground text-[36px] leading-none font-bold"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                ${listing.price.toLocaleString()}
              </span>
              <span
                className="text-muted-foreground text-xs"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {stockLabel}
              </span>
            </div>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-3 text-sm font-semibold tracking-wide transition-colors"
                style={{ borderRadius: "2px" }}
              >
                Buy Now
              </button>
              <button
                type="button"
                className="border-border-subtle text-foreground hover:border-border-emphasis border px-6 py-3 text-sm font-medium tracking-wide transition-colors"
                style={{ borderRadius: "2px" }}
              >
                Make an Offer
              </button>
            </div>

            <Link
              to="/profile"
              className="border-border bg-card hover:border-border-hover mb-8 flex items-center gap-3 border p-4 transition-colors"
              style={{ borderRadius: "2px" }}
            >
              <div className="bg-secondary text-foreground-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                {sellerInitials(listing.seller)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-foreground text-sm font-medium">
                  {listing.seller}
                </div>
                <div
                  className="text-muted-foreground text-[10px]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {listing.sellerRating.toFixed(1)} rating ·{" "}
                  {listing.sellerSales} sales · {listing.location}
                </div>
              </div>
              <span
                className="text-muted-foreground shrink-0 text-xs"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Profile →
              </span>
            </Link>

            <section className="mb-8">
              <h2
                className="text-muted-foreground mb-3 text-[10px] tracking-[0.15em] uppercase"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Description
              </h2>
              <p className="text-foreground-muted text-sm leading-relaxed font-light">
                {listing.description}
              </p>
            </section>

            <section className="mb-8">
              <h2
                className="text-muted-foreground mb-3 text-[10px] tracking-[0.15em] uppercase"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Details
              </h2>
              <dl className="border-border border-t">
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
                    className="border-border grid grid-cols-2 gap-4 border-b py-3"
                  >
                    <dt
                      className="text-muted-foreground text-xs"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {row.name}
                    </dt>
                    <dd className="text-foreground text-right text-sm">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h2
                className="text-muted-foreground mb-3 text-[10px] tracking-[0.15em] uppercase"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-border bg-card text-foreground-muted border px-2.5 py-1 text-[11px]"
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
          <section className="border-border mt-16 border-t pt-12 lg:mt-20">
            <div className="mb-8 flex items-end justify-between">
              <h2
                className="text-foreground text-[28px] font-bold sm:text-[32px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                More like this
              </h2>
              <Link
                to="/browse"
                className="text-muted-foreground hover:text-foreground ml-4 shrink-0 text-xs tracking-wide transition-colors"
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
