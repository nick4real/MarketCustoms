import GridCard from "./GridCard";

function Grid() {
  const items = Array.from({ length: 20 }, (_, index) => ({
    itemName: `Item ${index + 1}`,
    itemPrice: index + 1,
  }));

  return (
    <>
      <div className="grid w-full p-4 border grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <GridCard
            key={item.itemName}
            itemName={item.itemName}
            itemPrice={item.itemPrice}
          />
        ))}
      </div>
    </>
  );
}

export default Grid;
