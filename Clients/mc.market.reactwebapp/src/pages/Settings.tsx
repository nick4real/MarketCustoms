import { useState } from "react";
import { useVisitorSession } from "../auth/useVisitorSession";

type Section = "account" | "notifications" | "payment" | "privacy" | "security";

const sections: { id: Section; label: string }[] = [
  { id: "account", label: "Account" },
  { id: "notifications", label: "Notifications" },
  { id: "payment", label: "Payment" },
  { id: "privacy", label: "Privacy" },
  { id: "security", label: "Security" },
];

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  const [val, setVal] = useState(defaultValue);
  return (
    <div>
      <label
        className="mb-2 block text-[10px] tracking-[0.15em] text-[#5a5550] uppercase"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full border border-[#1e1e1e] bg-[#111] px-4 py-2.5 text-sm text-[#f0ece3] transition-colors focus:border-[#e8820c] focus:outline-none"
        style={{ borderRadius: "2px", fontFamily: "Outfit, sans-serif" }}
      />
    </div>
  );
}

function Toggle({
  label,
  description,
  defaultOn = false,
}: {
  label: string;
  description: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between border-b border-[#1e1e1e] py-4 last:border-0">
      <div className="pr-6">
        <div className="text-sm font-medium text-[#f0ece3]">{label}</div>
        <div
          className="mt-0.5 text-xs text-[#5a5550]"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          {description}
        </div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className="relative h-5 w-10 shrink-0 transition-colors duration-200"
        style={{
          borderRadius: "10px",
          backgroundColor: on ? "#e8820c" : "#1e1e1e",
        }}
      >
        <div
          className="absolute top-0.5 h-4 w-4 bg-[#f0ece3] transition-all duration-200"
          style={{ borderRadius: "8px", left: on ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const [section, setSection] = useState<Section>("account");
  const { account } = useVisitorSession();
  const displayName = account?.displayName ?? "";
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
  const username = account?.email?.split("@")[0] ?? "";
  const email = account?.email ?? "";
  const initials = (firstName[0] ?? username[0] ?? "M").toUpperCase();

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="overflow-x-auto border-b border-[#1e1e1e] px-4 md:hidden">
        <div className="flex w-max gap-1 py-3">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`px-4 py-1.5 text-sm whitespace-nowrap transition-colors ${
                section === s.id
                  ? "bg-[#e8820c] font-semibold text-[#080808]"
                  : "border border-[#1e1e1e] text-[#5a5550] hover:text-[#a09890]"
              }`}
              style={{ borderRadius: "2px" }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-52 shrink-0 self-start border-r border-[#1e1e1e] p-7 md:block">
          <h2
            className="mb-8 text-xl font-bold text-[#f0ece3]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Settings
          </h2>
          <nav className="flex flex-col gap-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`px-3 py-2 text-left text-sm transition-colors ${
                  section === s.id
                    ? "text-[#e8820c]"
                    : "text-[#5a5550] hover:text-[#a09890]"
                }`}
                style={{ borderRadius: "2px" }}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="max-w-2xl flex-1 px-4 py-8 md:px-12 md:py-10">
          {section === "account" && (
            <div>
              <h3
                className="mb-7 text-[22px] font-bold text-[#f0ece3] md:mb-8 md:text-[26px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Account
              </h3>

              <div className="mb-8 flex flex-col gap-4 border-b border-[#1e1e1e] pb-8 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#1e1e1e] bg-[#1a1a1a] text-sm font-semibold text-[#a09890]">
                  {account?.photoUrl ? (
                    <img
                      src={account.photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span style={{ fontFamily: "DM Mono, monospace" }}>
                      {initials}
                    </span>
                  )}
                </div>
                <div>
                  <button
                    className="border border-[#2a2a2a] px-4 py-1.5 text-sm font-medium text-[#f0ece3] transition-colors hover:border-[#4a4540]"
                    style={{ borderRadius: "2px" }}
                  >
                    Change photo
                  </button>
                  <p
                    className="mt-2 text-xs text-[#5a5550]"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    PNG or JPG, max 5MB
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="First name" defaultValue={firstName} />
                  <Field label="Last name" defaultValue={lastName} />
                </div>
                <Field label="Username" defaultValue={username} />
                <Field
                  label="Email address"
                  defaultValue={email}
                  type="email"
                />
                <Field label="Location" defaultValue="" />
                <div>
                  <label
                    className="mb-2 block text-[10px] tracking-[0.15em] text-[#5a5550] uppercase"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Based in Tokyo. I collect and sell considered objects."
                    className="w-full resize-none border border-[#1e1e1e] bg-[#111] px-4 py-2.5 text-sm text-[#f0ece3] transition-colors focus:border-[#e8820c] focus:outline-none"
                    style={{
                      borderRadius: "2px",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  />
                </div>
                <button
                  className="w-full bg-[#e8820c] px-6 py-2.5 text-sm font-semibold text-[#080808] transition-colors hover:bg-[#cf7108] sm:w-auto"
                  style={{ borderRadius: "2px" }}
                >
                  Save changes
                </button>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div>
              <h3
                className="mb-7 text-[22px] font-bold text-[#f0ece3] md:mb-8 md:text-[26px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Notifications
              </h3>
              <Toggle
                label="New offers"
                description="When someone makes an offer on your listing"
                defaultOn={true}
              />
              <Toggle
                label="Direct messages"
                description="Messages from buyers and sellers"
                defaultOn={true}
              />
              <Toggle
                label="Order updates"
                description="Shipping and delivery notifications"
                defaultOn={true}
              />
              <Toggle
                label="New followers"
                description="When someone follows your profile"
                defaultOn={false}
              />
              <Toggle
                label="Price drops"
                description="When watched items drop in price"
                defaultOn={true}
              />
              <Toggle
                label="Weekly digest"
                description="Summary of your marketplace activity"
                defaultOn={false}
              />
            </div>
          )}

          {section === "payment" && (
            <div>
              <h3
                className="mb-7 text-[22px] font-bold text-[#f0ece3] md:mb-8 md:text-[26px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Payment
              </h3>
              <div className="mb-8 border-b border-[#1e1e1e] pb-8">
                <h4
                  className="mb-4 text-[10px] tracking-[0.15em] text-[#5a5550] uppercase"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Payment methods
                </h4>
                <div
                  className="mb-3 flex items-center justify-between border border-[#1e1e1e] bg-[#111] p-4"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-6 w-10 shrink-0 items-center justify-center bg-[#1a1a1a]"
                      style={{ borderRadius: "2px" }}
                    >
                      <span
                        className="text-[9px] font-bold tracking-wider text-[#f0ece3]"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        VISA
                      </span>
                    </div>
                    <span className="truncate text-sm text-[#f0ece3]">
                      •••• 4829
                    </span>
                    <span
                      className="hidden text-xs text-[#5a5550] sm:block"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      09/28
                    </span>
                  </div>
                  <span
                    className="ml-2 shrink-0 text-xs text-[#e8820c]"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    Primary
                  </span>
                </div>
                <button
                  className="text-sm text-[#5a5550] transition-colors hover:text-[#f0ece3]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  + Add payment method
                </button>
              </div>
              <Field
                label="Bank account (IBAN)"
                defaultValue="JP82 0001 0019 9887 2309 8741"
              />
            </div>
          )}

          {section === "privacy" && (
            <div>
              <h3
                className="mb-7 text-[22px] font-bold text-[#f0ece3] md:mb-8 md:text-[26px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Privacy
              </h3>
              <Toggle
                label="Public profile"
                description="Anyone can view your profile and listings"
                defaultOn={true}
              />
              <Toggle
                label="Show location"
                description="Display your city on your listings"
                defaultOn={true}
              />
              <Toggle
                label="Activity status"
                description="Let others see when you were last active"
                defaultOn={false}
              />
              <Toggle
                label="Search engine indexing"
                description="Allow your profile to appear in web search"
                defaultOn={false}
              />
              <div className="mt-8 border-t border-[#1e1e1e] pt-8">
                <div className="mb-1 text-sm font-medium text-[#f0ece3]">
                  Data export
                </div>
                <p
                  className="mb-4 text-xs text-[#5a5550]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Download a copy of all your MKT. data.
                </p>
                <button
                  className="border border-[#2a2a2a] px-4 py-2 text-sm text-[#f0ece3] transition-colors hover:border-[#4a4540]"
                  style={{ borderRadius: "2px" }}
                >
                  Request export
                </button>
              </div>
            </div>
          )}

          {section === "security" && (
            <div>
              <h3
                className="mb-7 text-[22px] font-bold text-[#f0ece3] md:mb-8 md:text-[26px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Security
              </h3>
              <div className="mb-10 space-y-5 border-b border-[#1e1e1e] pb-10">
                <Field
                  label="Current password"
                  defaultValue=""
                  type="password"
                />
                <Field label="New password" defaultValue="" type="password" />
                <Field
                  label="Confirm new password"
                  defaultValue=""
                  type="password"
                />
                <button
                  className="w-full bg-[#e8820c] px-6 py-2.5 text-sm font-semibold text-[#080808] transition-colors hover:bg-[#cf7108] sm:w-auto"
                  style={{ borderRadius: "2px" }}
                >
                  Update password
                </button>
              </div>
              <Toggle
                label="Two-factor authentication"
                description="Require a code when signing in from a new device"
                defaultOn={false}
              />
              <div className="mt-8 border-t border-[#1e1e1e] pt-8">
                <div className="mb-1 text-sm font-medium text-[#dc4040]">
                  Danger zone
                </div>
                <p
                  className="mb-4 text-xs text-[#5a5550]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Permanently delete your account and all associated data.
                </p>
                <button
                  className="border border-[#dc4040]/30 px-4 py-2 text-sm text-[#dc4040] transition-colors hover:border-[#dc4040]/70"
                  style={{ borderRadius: "2px" }}
                >
                  Delete account
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
