import { ListingCard, useLatestListingsQuery } from "@/entities/listing";
import { routes } from "@/shared/config";
import { SectionHeader, StatusMessage } from "@/shared/ui";

export function TrendingStrip() {
  // TODO: Get trending listings from the API
  const { data, isPending, isError } = useLatestListingsQuery(4);

  if (data?.length === 0) {
    return null;
  }

  return (
    <section className="border-border border-t px-6 py-14 md:px-12 lg:px-16 lg:py-20">
      <SectionHeader
        title="Trending Now"
        subtitle="High-demand items, moving fast."
        action={{ to: routes.browse, label: "See all →" }}
      />

      {isPending ? (
        <StatusMessage size="inline" message="Loading trending listings…" />
      ) : isError ? (
        <StatusMessage
          size="inline"
          message="Couldn't load trending listings"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      )}
    </section>
  );
}
