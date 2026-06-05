import Grid from "../components/Grid";

function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-50px">
        <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
        <h2 className="text-lg font-bold mt-4">Popular Products</h2>
        <Grid />
        <h2 className="text-lg font-bold mt-4">New Products</h2>
        <Grid />
        <h2 className="text-lg font-bold mt-4">Special Offers</h2>
        <Grid />
      </div>
    </>
  );
}

export default Home;
