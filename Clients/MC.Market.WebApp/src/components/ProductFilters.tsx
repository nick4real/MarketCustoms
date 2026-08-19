import type { ProductParameter } from "../models/product";

interface Props {
  filters: ProductParameter[];
  onChange: (filters: ProductParameter[]) => void;
  className?: string;
}

function ProductFilters({ filters, onChange, className = "" }: Props) {
  const updateFilter = (
    index: number,
    field: keyof ProductParameter,
    value: string,
  ) => {
    const next = filters.map((filter, currentIndex) =>
      currentIndex === index ? { ...filter, [field]: value } : filter,
    );
    onChange(next);
  };

  const addFilter = () => onChange([...filters, { name: "", value: "" }]);

  const removeFilter = (index: number) =>
    onChange(filters.filter((_, currentIndex) => currentIndex !== index));

  return (
    <section className={`rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Product filters
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Narrow products by the attributes they already have.
          </p>
        </div>
        <button
          type="button"
          onClick={addFilter}
          className="rounded-xl border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950"
        >
          Add filter
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {filters.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No active filters.
          </p>
        )}

        {filters.map((filter, index) => (
          <div key={`${index}-${filter.name}-${filter.value}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="text"
              value={filter.name}
              onChange={(event) => updateFilter(index, "name", event.target.value)}
              placeholder="Parameter name"
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
            <input
              type="text"
              value={filter.value}
              onChange={(event) => updateFilter(index, "value", event.target.value)}
              placeholder="Parameter value"
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            />
            <button
              type="button"
              onClick={() => removeFilter(index)}
              className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductFilters;
