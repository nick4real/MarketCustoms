import { Link } from "react-router";
import type { Product } from "../../models/product";
import { formatPrice, productImageSrc } from "../lib/format";

interface Props {
  product: Product;
}

function GridCard({ product }: Props) {
  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-600"
    >
      <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={productImageSrc(product.imageLink)}
          alt={product.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-white">
          {product.title}
        </h3>
        <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
          {product.description}
        </p>
        <p className="mt-auto pt-2 text-base font-bold text-amber-600 dark:text-amber-400">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

export default GridCard;
