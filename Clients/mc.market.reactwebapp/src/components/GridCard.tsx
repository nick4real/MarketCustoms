import type { Product } from "../../models/product";

interface Props {
  product: Product;
}

function GridCard({ product }: Props) {
  return (
    <>
      <div className="border p-2 flex flex-col items-center">
        <div className="font-bold italic">{product.title}</div>
        <div className="">{product.price} zł</div>
        <img
          src={product.image.url}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>
    </>
  );
}

export default GridCard;
