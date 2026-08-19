import GridCard from "./GridCard";
import EmptyState from "./EmptyState";
import type { Product } from "../models/product";

interface Props {
  products: Product[];
}

function Grid({ products }: Props) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="Check back soon or list your own products from the dashboard."
      />
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {products.map((product) => (
        <GridCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default Grid;
