function General() {
  return (
    <>
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Welcome back
      </h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
        Manage your products, track orders, and grow your shop on MarketCustoms.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Active listings", value: "—" },
          { label: "Orders this month", value: "—" },
          { label: "Revenue", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export default General;
