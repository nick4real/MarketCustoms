import EmptyState from "../components/EmptyState";

function ProfilesUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-10 sm:px-6">
      <EmptyState
        title="Profiles is unavailable"
        description="We could not load your profile status. Retry when the service is back, or sign out to continue browsing as a guest."
      />
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400"
      >
        Retry
      </button>
    </div>
  );
}

export default ProfilesUnavailable;
