import { useState } from "react";

function MyProducts() {
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const toggleModal = () => {
    setIsAddingProduct(!isAddingProduct);
  };

  return (
    <>
      <h2 className="text-2xl font-bold">My Products</h2>
      <p className="text-lg">Welcome to the my products</p>
      <p className="text-lg">Here you can manage your products</p>
      <p className="text-lg">You can also view your products</p>
      <p className="text-lg">You can also view your products</p>
      <button
        className="bg-blue-500 text-white p-2 rounded-md"
        onClick={toggleModal}
      >
        Add Product
      </button>
      {isAddingProduct && (
        <div
          onClick={toggleModal}
          className="fixed inset-0 bg-black/90  z-25 flex items-center justify-center"
        >
          <div className="flex flex-col gap-2 border p-4 rounded-xl">
            <h2 className="text-2xl font-bold">Add Product</h2>
            <input type="text" placeholder="Product Name" />
            <input type="text" placeholder="Product Description" />
            <input type="text" placeholder="Product Price" />
            <input type="text" placeholder="Product Image Link" />
            <button
              className="bg-blue-500 text-white p-2 rounded-md"
              onClick={toggleModal}
            >
              Add Product
            </button>
            <button
              className="bg-gray-800 text-white p-2 rounded-md"
              onClick={toggleModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MyProducts;
