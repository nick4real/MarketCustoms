import GridCard from "./GridCard";
import type { Product } from "../../models/product";

interface Props {
  products: Product[];
}

function Grid({ products }: Props) {
  return (
    <>
      <div className="grid w-full p-4 border grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {products.length > 0 &&
          products.map((product) => (
            <GridCard key={product.id} product={product} />
          ))}
      </div>
    </>
  );
}

export default Grid;
