import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchProductById } from "../api/products";
import type { ProductDetail } from "../../models/product";
import { formatPrice, productImageSrc } from "../lib/format";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchProductById(id)
      .then((data) => {
        setProduct(data);
        setSelectedImage(0);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingSpinner label="Loading product..." />;
  }

  if (error || !product) {
    return (
      <div className="w-full px-4 py-8 sm:px-6">
        <EmptyState
          title="Product not found"
          description={error ?? "This product may have been removed."}
        />
        <div className="mt-6 text-center">
          <Link
            to="/browse"
            className="text-sm font-semibold text-amber-600 hover:text-amber-500"
          >
            ← Back to browse
          </Link>
        </div>
      </div>
    );
  }

  const images =
    product.imageLinks.length > 0
      ? product.imageLinks
      : [productImageSrc()];

  return (
    <div className="w-full px-4 py-8 sm:px-6">
      <Link
        to="/browse"
        className="text-sm text-zinc-500 hover:text-amber-600 dark:text-zinc-400"
      >
        ← Back to browse
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
            <img
              src={productImageSrc(images[selectedImage])}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                    selectedImage === index
                      ? "border-amber-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={productImageSrc(image)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {product.category.name}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {product.title}
            </h1>
          </div>

          <p className="text-3xl font-bold text-zinc-900 dark:text-white">
            {formatPrice(product.price)}
          </p>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : "Out of stock"}
          </p>

          <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
            {product.description}
          </p>

          <button
            type="button"
            disabled={product.stockQuantity <= 0}
            className="mt-2 w-full rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {product.stockQuantity > 0 ? "Add to cart" : "Unavailable"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
