import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useOnboarding } from "../auth/OnboardingGate";
import { completeClarification } from "../api/profiles";

function claimValue(user: Record<string, unknown> | undefined, key: string): string {
  const value = user?.[key];
  return typeof value === "string" ? value : "";
}

function ClarifyProfile() {
  const { user, getAccessTokenSilently } = useAuth0();
  const onboarding = useOnboarding();
  const navigate = useNavigate();
  const userRecord = user as Record<string, unknown> | undefined;
  const [displayName, setDisplayName] = useState(
    () => claimValue(userRecord, "name") || claimValue(userRecord, "nickname"),
  );
  const [email, setEmail] = useState(() => claimValue(userRecord, "email"));
  const [phoneNumber, setPhoneNumber] = useState(
    () => claimValue(userRecord, "phone_number"),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phoneNumber.trim();

    if (!trimmedName || (!trimmedEmail && !trimmedPhone)) {
      setError("Provide a display name and at least one of email or phone.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const accessToken = await getAccessTokenSilently();
      const profile = await completeClarification(
        {
          displayName: trimmedName,
          email: trimmedEmail || null,
          phoneNumber: trimmedPhone || null,
        },
        accessToken,
      );
      onboarding?.markVerified(profile.isSeller);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete your profile.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Confirm your profile
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Review your display name and at least one contact method to continue.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="flex flex-col gap-3">
          <input
            name="displayName"
            type="text"
            required
            maxLength={100}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Display name"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
          <input
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
          />
          <input
            name="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="Phone number"
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
          {submitting ? "Saving..." : "Confirm profile"}
        </button>
      </form>
    </div>
  );
}

export default ClarifyProfile;
