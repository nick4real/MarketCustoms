function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-500 dark:text-zinc-400">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-amber-500 dark:border-zinc-700 dark:border-t-amber-400"
        role="status"
        aria-label={label}
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export default LoadingSpinner;
