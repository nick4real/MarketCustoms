import { useListingSearchState } from "../model/listingSearchStore";

export function SearchFilter() {
  const {
    searchText,
    actions: { setSearchText },
  } = useListingSearchState();

  return (
    <div className="relative mb-2">
      <input
        type="text"
        placeholder="Search listings..."
        value={searchText ?? ""}
        onChange={(e) => setSearchText(e.target.value)}
        className="border-border bg-surface text-foreground placeholder-foreground-subtle focus:border-primary w-full rounded-xs border px-3 py-2 pl-8 text-sm transition-colors focus:outline-none"
      />
      <svg
        className="text-foreground-subtle absolute top-2.5 left-2.5"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </div>
  );
}
