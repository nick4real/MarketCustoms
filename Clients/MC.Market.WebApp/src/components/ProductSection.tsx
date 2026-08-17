import Grid from "./Grid";
import type { Product } from "../../models/product";

interface Props {
  title: string;
  subtitle?: string;
  products: Product[];
  action?: React.ReactNode;
}

function ProductSection({ title, subtitle, products, action }: Props) {
  return (
    <section className="w-full">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      <Grid products={products} />
    </section>
  );
}

export default ProductSection;
