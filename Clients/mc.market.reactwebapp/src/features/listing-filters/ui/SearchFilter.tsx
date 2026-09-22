import { useListingStoreState } from "@/entities/listing";

export function SearchFilter() {
  const {
    searchText,
    actions: { setSearchText },
  } = useListingStoreState();

  return (
    <div className="relative mb-7">
      <input
        type="text"
        placeholder="Search listings..."
        value={searchText ?? undefined}
        onChange={(e) => setSearchText(e.target.value ?? null)}
        className="border-border bg-surface text-foreground placeholder-foreground-subtle focus:border-primary w-full border px-3 py-2 pl-8 text-sm transition-colors focus:outline-none"
        style={{ borderRadius: "2px", fontFamily: "Outfit, sans-serif" }}
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
