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
        className="text-muted-foreground mb-2 block text-[10px] tracking-[0.15em] uppercase"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="border-border bg-card text-foreground focus:border-primary w-full border px-4 py-2.5 text-sm transition-colors focus:outline-none"
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
    <div className="border-border flex items-center justify-between border-b py-4 last:border-0">
      <div className="pr-6">
        <div className="text-foreground text-sm font-medium">{label}</div>
        <div
          className="text-muted-foreground mt-0.5 text-xs"
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
          className="bg-foreground absolute top-0.5 h-4 w-4 transition-all duration-200"
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
    <div className="bg-background min-h-screen">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="border-border overflow-x-auto border-b px-4 md:hidden">
        <div className="flex w-max gap-1 py-3">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`px-4 py-1.5 text-sm whitespace-nowrap transition-colors ${
                section === s.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border-border text-muted-foreground hover:text-foreground-muted border"
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
        <aside className="border-border sticky top-14 hidden h-[calc(100vh-56px)] w-52 shrink-0 self-start border-r p-7 md:block">
          <h2
            className="text-foreground mb-8 text-xl font-bold"
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
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground-muted"
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
                className="text-foreground mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Account
              </h3>

              <div className="border-border mb-8 flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-center">
                <div className="border-border bg-secondary text-foreground-muted flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border text-sm font-semibold">
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
                    className="border-border-subtle text-foreground hover:border-border-emphasis border px-4 py-1.5 text-sm font-medium transition-colors"
                    style={{ borderRadius: "2px" }}
                  >
                    Change photo
                  </button>
                  <p
                    className="text-muted-foreground mt-2 text-xs"
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
                    className="text-muted-foreground mb-2 block text-[10px] tracking-[0.15em] uppercase"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Based in Tokyo. I collect and sell considered objects."
                    className="border-border bg-card text-foreground focus:border-primary w-full resize-none border px-4 py-2.5 text-sm transition-colors focus:outline-none"
                    style={{
                      borderRadius: "2px",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  />
                </div>
                <button
                  className="bg-primary text-primary-foreground hover:bg-primary-hover w-full px-6 py-2.5 text-sm font-semibold transition-colors sm:w-auto"
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
                className="text-foreground mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]"
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
                className="text-foreground mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Payment
              </h3>
              <div className="border-border mb-8 border-b pb-8">
                <h4
                  className="text-muted-foreground mb-4 text-[10px] tracking-[0.15em] uppercase"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Payment methods
                </h4>
                <div
                  className="border-border bg-card mb-3 flex items-center justify-between border p-4"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="bg-secondary flex h-6 w-10 shrink-0 items-center justify-center"
                      style={{ borderRadius: "2px" }}
                    >
                      <span
                        className="text-foreground text-[9px] font-bold tracking-wider"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        VISA
                      </span>
                    </div>
                    <span className="text-foreground truncate text-sm">
                      •••• 4829
                    </span>
                    <span
                      className="text-muted-foreground hidden text-xs sm:block"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      09/28
                    </span>
                  </div>
                  <span
                    className="text-primary ml-2 shrink-0 text-xs"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    Primary
                  </span>
                </div>
                <button
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
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
                className="text-foreground mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]"
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
              <div className="border-border mt-8 border-t pt-8">
                <div className="text-foreground mb-1 text-sm font-medium">
                  Data export
                </div>
                <p
                  className="text-muted-foreground mb-4 text-xs"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Download a copy of all your MKT. data.
                </p>
                <button
                  className="border-border-subtle text-foreground hover:border-border-emphasis border px-4 py-2 text-sm transition-colors"
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
                className="text-foreground mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Security
              </h3>
              <div className="border-border mb-10 space-y-5 border-b pb-10">
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
                  className="bg-primary text-primary-foreground hover:bg-primary-hover w-full px-6 py-2.5 text-sm font-semibold transition-colors sm:w-auto"
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
              <div className="border-border mt-8 border-t pt-8">
                <div className="text-destructive mb-1 text-sm font-medium">
                  Danger zone
                </div>
                <p
                  className="text-muted-foreground mb-4 text-xs"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Permanently delete your account and all associated data.
                </p>
                <button
                  className="border-destructive/30 text-destructive hover:border-destructive/70 border px-4 py-2 text-sm transition-colors"
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
