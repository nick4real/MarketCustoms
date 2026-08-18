import { useNavigate } from "react-router";
import { useState } from "react";

interface Props {
  query?: string;
  className?: string;
}

function SearchBar({ query = "", className = "" }: Props) {
  const navigate = useNavigate();
  const [value, setValue] = useState(query);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = value.trim();
    navigate(nextQuery ? `/browse?q=${encodeURIComponent(nextQuery)}` : "/browse");
  };

  return (
    <form onSubmit={handleSubmit} className={`flex w-full max-w-2xl overflow-hidden ${className}`}>
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search products..."
        className="w-full rounded-l-xl border border-r-0 border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:focus:border-amber-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            navigate("/browse");
          }}
          className="border-y border-zinc-300 bg-white px-3 text-sm text-zinc-500 transition hover:text-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          Clear
        </button>
      )}
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
