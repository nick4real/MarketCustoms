import { useEffect, useReducer, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchProductById } from "../api/products";
import type { ProductDetail } from "../../models/product";
import { formatPrice, productImageSrc } from "../lib/format";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

type DetailState = {
  product: ProductDetail | null;
  loading: boolean;
  error: string | null;
};

type DetailAction =
  | { type: "start" }
  | { type: "success"; product: ProductDetail }
  | { type: "error"; message: string };

const initialState: DetailState = {
  product: null,
  loading: true,
  error: null,
};

function reducer(state: DetailState, action: DetailAction): DetailState {
  switch (action.type) {
    case "start":
      return { ...state, loading: true, error: null };
    case "success":
      return { product: action.product, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.message };
    default:
      return state;
  }
}

function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    dispatch({ type: "start" });
    fetchProductById(id)
      .then((data) => {
        if (!cancelled) {
          dispatch({ type: "success", product: data });
          setSelectedImage(0);
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
  }, [id]);

  if (state.loading) {
    return <LoadingSpinner label="Loading product..." />;
  }

  if (state.error || !state.product) {
    return (
      <div className="w-full px-4 py-8 sm:px-6">
        <EmptyState
          title="Product not found"
          description={state.error ?? "This product may have been removed."}
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

  const product = state.product;
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

          {product.parameters.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Product parameters
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.parameters.map((parameter) => (
                  <span
                    key={`${parameter.name}-${parameter.value}`}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {parameter.name}: {parameter.value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.tags.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Tags
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

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
