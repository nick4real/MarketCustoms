import { useEffect, useMemo, useReducer, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { fetchProducts } from "../api/products";
import type { Product, ProductParameter } from "../../models/product";
import Grid from "../components/Grid";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ProductFilters from "../components/ProductFilters";

type BrowseState = {
  products: Product[];
  loading: boolean;
  error: string | null;
};

type BrowseAction =
  | { type: "start" }
  | { type: "success"; products: Product[] }
  | { type: "error"; message: string };

const initialState: BrowseState = {
  products: [],
  loading: true,
  error: null,
};

function reducer(state: BrowseState, action: BrowseAction): BrowseState {
  switch (action.type) {
    case "start":
      return { ...state, loading: true, error: null };
    case "success":
      return { products: action.products, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.message };
    default:
      return state;
  }
}

function Browse() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [state, dispatch] = useReducer(reducer, initialState);
  const [filters, setFilters] = useState<ProductParameter[]>([]);

  const activeFilters = useMemo(
    () =>
      filters.filter(
        (filter) => filter.name.trim().length > 0 && filter.value.trim().length > 0,
      ),
    [filters],
  );

  useEffect(() => {
    let cancelled = false;
    dispatch({ type: "start" });

    fetchProducts(
      1,
      48,
      query || activeFilters.length > 0
        ? {
            searchText: query,
            parameters: activeFilters,
          }
        : undefined,
    )
      .then((response) => {
        if (!cancelled) {
          dispatch({ type: "success", products: response.items });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          dispatch({ type: "error", message: err.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeFilters, query]);

  const clearFilters = () => setFilters([]);

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/"
            className="text-sm text-zinc-500 hover:text-amber-600 dark:text-zinc-400"
          >
            ← Back to home
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {query ? `Results for "${query}"` : "Browse all products"}
          </h1>
          {!state.loading && !state.error && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {state.products.length} product{state.products.length === 1 ? "" : "s"} on this
              page
              {activeFilters.length > 0
                ? ` · ${activeFilters.length} active filter${activeFilters.length === 1 ? "" : "s"}`
                : ""}
            </p>
          )}
        </div>
        <SearchBar key={query} query={query} className="sm:max-w-md" />
      </div>

      <ProductFilters filters={filters} onChange={setFilters} />

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span
              key={`${filter.name}-${filter.value}`}
              className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200"
            >
              {filter.name}: {filter.value}
            </span>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-zinc-500 hover:text-amber-600 dark:text-zinc-400"
          >
            Clear filters
          </button>
        </div>
      )}

      {state.loading && <LoadingSpinner />}
      {!state.loading && state.error && (
        <EmptyState title="Could not load products" description={state.error} />
      )}
      {!state.loading && !state.error && state.products.length === 0 && (
        <EmptyState
          title="No matching products"
          description="Try a different search term or adjust the parameter filters."
        />
      )}
      {!state.loading && !state.error && state.products.length > 0 && (
        <Grid products={state.products} />
      )}
    </div>
  );
}

export default Browse;
