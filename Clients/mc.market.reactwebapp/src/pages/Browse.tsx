import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { fetchProducts } from "../api/products";
import type { Product } from "../../models/product";
import Grid from "../components/Grid";
import SearchBar from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

function Browse() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProducts(1, 48)
      .then((response) => setProducts(response.items))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query) return products;
    const lower = query.toLowerCase();
    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(lower) ||
        product.description.toLowerCase().includes(lower),
    );
  }, [products, query]);

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
          {!loading && !error && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {filteredProducts.length} product
              {filteredProducts.length === 1 ? "" : "s"} found
            </p>
          )}
        </div>
        <SearchBar initialQuery={query} className="sm:max-w-md" />
      </div>

      {loading && <LoadingSpinner />}
      {!loading && error && (
        <EmptyState title="Could not load products" description={error} />
      )}
      {!loading && !error && filteredProducts.length === 0 && (
        <EmptyState
          title="No matching products"
          description="Try a different search term or browse the full catalog."
        />
      )}
      {!loading && !error && filteredProducts.length > 0 && (
        <Grid products={filteredProducts} />
      )}
    </div>
  );
}

export default Browse;
