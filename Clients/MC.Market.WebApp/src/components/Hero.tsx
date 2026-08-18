import SearchBar from "./SearchBar";

function Hero() {
  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-linear-to-br from-amber-500 via-orange-500 to-rose-500 px-6 py-14 text-white shadow-lg sm:px-10 sm:py-20">
      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-black/10 blur-2xl" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/80">
          Your marketplace
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Discover unique products on MarketCustoms
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
          Buy from independent sellers or list your own products. Fresh finds,
          fair prices, all in one place.
        </p>
        <SearchBar className="mt-8" />
      </div>
    </section>
  );
}

export default Hero;
