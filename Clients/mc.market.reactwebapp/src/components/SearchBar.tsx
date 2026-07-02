import { useNavigate } from "react-router";

interface Props {
  initialQuery?: string;
  className?: string;
}

function SearchBar({ initialQuery = "", className = "" }: Props) {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    navigate(query ? `/browse?q=${encodeURIComponent(query)}` : "/browse");
  };

  return (
    <form onSubmit={handleSubmit} className={`flex w-full max-w-2xl ${className}`}>
      <input
        type="search"
        name="q"
        defaultValue={initialQuery}
        placeholder="Search products..."
        className="w-full rounded-l-xl border border-r-0 border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-amber-400"
      />
      <button
        type="submit"
        className="rounded-r-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400"
      >
        Search
      </button>
    </form>
  );
}

export default SearchBar;
