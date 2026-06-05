interface Props {
  itemName: string;
  itemPrice: number;
}

function GridCard({ itemName, itemPrice }: Props) {
  return (
    <>
      <div className="border p-2 flex flex-col items-center">
        <div className="font-bold italic">{itemName}</div>
        <div className="">{itemPrice} zł</div>
      </div>
    </>
  );
}

export default GridCard;
