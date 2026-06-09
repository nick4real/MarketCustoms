import Grid from "../components/Grid";
import { useEffect, useState } from "react";
import type { ProductPaginatedResponse } from "../../models/product";

function Home() {
  const [productsPaginatedResponse, setProductsPaginatedResponse] =
    useState<ProductPaginatedResponse>({
      items: [],
      pageSize: 0,
      pageIndex: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  useEffect(() => {
    fetch("/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.url}`);
        }
        return response.json();
      })
      .then((data) => setProductsPaginatedResponse(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  return (
    <>
      <div className="flex flex-col items-center justify-center h-50px">
        <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
        <h2 className="text-lg font-bold mt-4">Popular Products</h2>
        <Grid products={productsPaginatedResponse.items} />
        <h2 className="text-lg font-bold mt-4">New Products</h2>
        <Grid products={[]} />
        <h2 className="text-lg font-bold mt-4">Special Offers</h2>
        <Grid products={[]} />
      </div>
    </>
  );
}

export default Home;
