import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  ConditionBadge,
  ListingCard,
  listingImageUrl,
  listingLocationLabel,
  listingSku,
  useListingQuery,
  useRelatedListingsQuery,
} from "@/entities/listing";
import {
  Avatar,
  Button,
  ButtonLink,
  Eyebrow,
  SectionHeader,
  StatusMessage,
} from "@/shared/ui";
import { isNotFoundError } from "@/shared/api";
import { routes } from "@/shared/config";
import { formatDate } from "@/shared/lib";

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
      <div className="border-border bg-surface aspect-4/3 overflow-hidden rounded-xs border">
        <img
          src={listingImageUrl(currentImage, 1200, 900)}
          alt={title}
          className="h-full w-full object-cover opacity-90"
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {images.map((imageUrl, index) => (
          <button
            key={imageUrl}
            type="button"
            onClick={() => setActiveImage(index)}
            className={`bg-surface aspect-4/3 overflow-hidden rounded-xs border transition-colors ${
              activeImage === index
                ? "border-primary"
                : "border-border hover:border-border-hover"
            }`}
            aria-label={`View photo ${index + 1}`}
          >
            <img
              src={listingImageUrl(imageUrl, 400, 300)}
              alt=""
              className="h-full w-full object-cover opacity-80"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ListingDetailsPage() {
  const { listingId } = useParams();
  const listingQuery = useListingQuery(listingId);
  const relatedQuery = useRelatedListingsQuery(listingQuery.data);

  if (isNotFoundError(listingQuery.error)) {
    return (
      <StatusMessage size="page" symbol="∅" message="Listing not found">
        <ButtonLink to={routes.browse} size="lg">
          Back to Browse
        </ButtonLink>
      </StatusMessage>
    );
  }

  if (listingQuery.isPending) {
    return <StatusMessage size="page" message="Loading..." />;
  }

  if (listingQuery.isError) {
    return (
      <StatusMessage
        size="page"
        symbol="Whoops!"
        message="Error loading listing"
      />
    );
  }

  const listing = listingQuery.data;
  const location = listingLocationLabel(listing.location);

  return (
    <div className="bg-background min-h-[calc(100vh-56px)]">
      <div className="px-6 pt-8 pb-4 md:px-12 lg:px-16">
        <nav className="text-muted-foreground flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <Link
            to={routes.browse}
            className="hover:text-foreground transition-colors"
          >
            Browse
          </Link>
          <span className="text-foreground-subtle">/</span>
          <Link
            to={routes.browseCategory(listing.categoryId)}
            className="hover:text-foreground transition-colors"
          >
            {listing.category.name}
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
              <ConditionBadge condition={listing.condition} />
              <Eyebrow as="span" className="tracking-normal normal-case">
                {listing.category.name}
              </Eyebrow>
              <span className="text-foreground-subtle">·</span>
              <Eyebrow as="span" className="tracking-normal normal-case">
                {location}
              </Eyebrow>
            </div>

            <h1 className="text-foreground font-display mb-4 text-[32px] leading-tight font-bold md:text-[40px]">
              {listing.title}
            </h1>

            <div className="mb-8 flex items-baseline gap-3">
              <span className="text-foreground font-display text-[36px] leading-none font-bold">
                ${listing.price.toLocaleString()}
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {listing.stock === 1
                  ? "1 available"
                  : `${listing.stock} available`}
              </span>
            </div>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg">Buy Now</Button>
              <Button variant="outline" size="lg">
                Make an Offer
              </Button>
            </div>

            <Link
              to={routes.profile}
              className="border-border bg-card hover:border-border-hover mb-8 flex items-center gap-3 rounded-xs border p-4 transition-colors"
            >
              <Avatar size="md" initials="—" />
              <div className="min-w-0 flex-1">
                <div className="text-foreground text-sm font-medium">—</div>
                <div className="text-muted-foreground font-mono text-[10px]">
                  {listing.sellerRating?.toFixed(1) ?? "—"} rating ·{" "}
                  {listing.sellerSales ?? "—"} sales · {location}
                </div>
              </div>
              <span className="text-muted-foreground shrink-0 font-mono text-xs">
                Profile →
              </span>
            </Link>

            <section className="mb-8">
              <Eyebrow as="h2" className="mb-3">
                Description
              </Eyebrow>
              <p className="text-foreground-muted text-sm leading-relaxed font-light">
                {listing.description}
              </p>
            </section>

            <section className="mb-8">
              <Eyebrow as="h2" className="mb-3">
                Details
              </Eyebrow>
              <dl className="border-border border-t">
                {[
                  { name: "Item ID", value: listingSku(listing.id) },
                  { name: "Listed", value: formatDate(listing.createdAt) },
                  {
                    name: "Condition",
                    value: listing.condition
                      ? listing.condition.charAt(0).toUpperCase() +
                        listing.condition.slice(1)
                      : "—",
                  },
                  { name: "Category", value: listing.category.name },
                  { name: "Ships from", value: location },
                  ...listing.parameters,
                ].map((row) => (
                  <div
                    key={row.name}
                    className="border-border grid grid-cols-2 gap-4 border-b py-3"
                  >
                    <dt className="text-muted-foreground font-mono text-xs">
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
              <Eyebrow as="h2" className="mb-3">
                Tags
              </Eyebrow>
              <div className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border-border bg-card text-foreground-muted rounded-xs border px-2.5 py-1 font-mono text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        {relatedQuery.isPending ? (
          <StatusMessage
            size="inline"
            className="mt-16"
            message="Loading related listings…"
          />
        ) : relatedQuery.isError ? (
          <StatusMessage
            size="inline"
            className="mt-16"
            message="Couldn't load related listings"
          />
        ) : relatedQuery.data.length > 0 ? (
          <section className="border-border mt-16 border-t pt-12 lg:mt-20">
            <SectionHeader
              title="More like this"
              action={{
                to: routes.browseCategory(listing.categoryId),
                label: "See all →",
              }}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedQuery.data.map((item) => (
                <ListingCard key={item.id} listing={item} showLocation />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
