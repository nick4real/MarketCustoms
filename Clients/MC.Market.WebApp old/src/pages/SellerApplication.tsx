import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useOnboarding } from "../auth/OnboardingGate";
import { getMySellerStatus, submitSellerApplication } from "../api/profiles";
import type { OwnerSellerStatus } from "../models/profile";
import LoadingSpinner from "../components/LoadingSpinner";

function SellerApplication() {
  const { getAccessTokenSilently } = useAuth0();
  const onboarding = useOnboarding();
  const [status, setStatus] = useState<OwnerSellerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shopName, setShopName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAccessTokenSilently()
      .then((token) => getMySellerStatus(token))
      .then((seller) => {
        if (!cancelled) {
          setStatus(seller);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load seller status.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [getAccessTokenSilently]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedShopName = shopName.trim();
    if (trimmedShopName.length < 2) {
      setError("Shop name must be between 2 and 80 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const accessToken = await getAccessTokenSilently();
      const result = await submitSellerApplication(
        {
          shopName: trimmedShopName,
          bio: bio.trim() || null,
        },
        accessToken,
      );
      await getAccessTokenSilently({ cacheMode: "off" });
      onboarding?.markVerified(true);
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit seller application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading seller status..." />;
  }

  if (status?.isSeller) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Seller profile</h1>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">You already have seller access.</p>
          <p className="mt-3 text-lg font-semibold text-zinc-900 dark:text-white">{status.shopName}</p>
          {status.bio && (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{status.bio}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Become a seller</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Choose a unique shop name. Your contact details stay private.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="flex flex-col gap-3">
          <input
            name="shopName"
            type="text"
            required
            minLength={2}
            maxLength={80}
            value={shopName}
            onChange={(event) => setShopName(event.target.value)}
            placeholder="Shop name"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
          <textarea
            name="bio"
            maxLength={500}
            rows={4}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder="Short public bio (optional)"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit application"}
        </button>
      </form>
    </div>
  );
}

export default SellerApplication;
