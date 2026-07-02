interface Props {
  title: string;
  description?: string;
}

function EmptyState({ title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
        {title}
      </p>
      {description && (
        <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}

export default EmptyState;
