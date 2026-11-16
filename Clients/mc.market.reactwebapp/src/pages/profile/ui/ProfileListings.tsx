import { useState } from "react";
import { ListingCard, useOwnerListingsQuery } from "@/entities/listing";
import { Button, StatusMessage } from "@/shared/ui";

export function ProfileListings({ ownerId }: { ownerId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, isPlaceholderData } = useOwnerListingsQuery(
    ownerId,
    page,
  );

  if (isPending) {
    return <StatusMessage size="inline" message="Loading..." />;
  }

  if (isError) {
    return <StatusMessage size="inline" message="Couldn't load listings" />;
  }

  if (data.items.length === 0) {
    return <StatusMessage size="inline" message="No active listings" />;
  }

  return (
    <div className="pb-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item) => (
          <ListingCard key={item.id} listing={item} showLocation />
        ))}
      </div>
      {data.totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            size="sm"
            disabled={!data.hasPreviousPage || isPlaceholderData}
            onClick={() => setPage(data.pageIndex - 1)}
          >
            ‹ Prev
          </Button>
          <span className="text-muted-foreground font-mono text-xs">
            {data.pageIndex} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!data.hasNextPage || isPlaceholderData}
            onClick={() => setPage(data.pageIndex + 1)}
          >
            Next ›
          </Button>
        </nav>
      )}
    </div>
  );
}
