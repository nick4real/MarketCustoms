import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { createProduct } from "../../api/products";

const CATEGORIES = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Fashion" },
  { id: 3, name: "Home & Garden" },
  { id: 4, name: "Sports" },
  { id: 5, name: "Other" },
];

function MyProducts() {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleModal = () => {
    setIsAddingProduct((open) => !open);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.sub) return;

    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const accessToken = await getAccessTokenSilently();
      const product = await createProduct(
        {
          ownerId: user.sub,
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? ""),
          categoryId: Number(formData.get("categoryId") ?? 1),
          price: Number(formData.get("price") ?? 0),
          stockQuantity: Number(formData.get("stockQuantity") ?? 1),
          imageLinks: [String(formData.get("imageLink") ?? "")].filter(Boolean),
          tags: [],
          parameters: [],
        },
        accessToken,
      );
      setSuccess(`"${product.title}" was added to the catalog.`);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? "Failed to create product: " + err.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          My Products
        </h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Sign in to list and manage your products.
        </p>
        <button
          type="button"
          className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900"
          onClick={() => loginWithRedirect()}
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            My Products
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create and manage your listings on MarketCustoms.
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400"
          onClick={toggleModal}
        >
          Add product
        </button>
      </div>

      {success && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          {success}
        </p>
      )}

      {isAddingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={toggleModal}
          role="presentation"
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Add product
            </h3>

            <div className="mt-4 flex flex-col gap-3">
              <input
                name="title"
                type="text"
                required
                placeholder="Product name"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Description"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
              <select
                name="categoryId"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              >
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="Price (PLN)"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
              <input
                name="stockQuantity"
                type="number"
                required
                min="1"
                defaultValue={1}
                placeholder="Stock quantity"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
              <input
                name="imageLink"
                type="url"
                placeholder="Image URL (optional)"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save product"}
              </button>
              <button
                type="button"
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-600"
                onClick={toggleModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default MyProducts;
