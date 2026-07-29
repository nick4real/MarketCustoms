import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchProducts } from "../api/products";
import type { Product } from "../../models/product";
import Hero from "../components/Hero";
import ProductSection from "../components/ProductSection";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { useAuth0 } from "@auth0/auth0-react";

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts(1, 24)
      .then((response) => setProducts(response.items))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  let token: string = "";

  useAuth0()
    .getAccessTokenSilently()
    .then((tok) => {
      token = tok;
      console.log(token);
    });

  const testWithoutToken = () => {
    console.log("Test without token");
    fetch("/api/profiles/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const testWithToken = () => {
    console.log("Test with token " + token);
    fetch("/api/profiles/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const popularProducts = products.slice(0, 12);
  const newProducts = [...products].reverse().slice(0, 6);
  const specialOffers = products.filter((p) => p.price < 100).slice(0, 6);

  return (
    <div className="flex w-full flex-col gap-12 px-4 py-8 sm:px-6">
      <Hero />

      <button onClick={() => testWithoutToken()}>Test Without Token</button>
      <button onClick={() => testWithToken()}>Test With Token</button>

      {loading && <LoadingSpinner label="Loading products..." />}

      {!loading && error && (
        <EmptyState
          title="Could not load products"
          description={`${error}. Make sure the catalog API is running.`}
        />
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <ProductSection
            title="Popular products"
            subtitle="Top picks from our marketplace"
            products={popularProducts}
            action={
              <Link
                to="/browse"
                className="text-sm font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400"
              >
                View all →
              </Link>
            }
          />

          {newProducts.length > 0 && (
            <ProductSection
              title="New arrivals"
              subtitle="Recently added to the catalog"
              products={newProducts}
            />
          )}

          {specialOffers.length > 0 && (
            <ProductSection
              title="Special offers"
              subtitle="Great deals under 100 zł"
              products={specialOffers}
            />
          )}
        </>
      )}

      {!loading && !error && products.length === 0 && (
        <EmptyState
          title="The marketplace is empty"
          description="Be the first seller — add a product from your dashboard."
        />
      )}
    </div>
  );
}

export default Home;
