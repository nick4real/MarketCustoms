import { useState } from "react";

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
        className="block text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-2"
        style={{ fontFamily: "DM Mono, monospace" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full bg-[#111] border border-[#1e1e1e] text-[#f0ece3] text-sm px-4 py-2.5 focus:outline-none focus:border-[#e8820c] transition-colors"
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
    <div className="flex items-center justify-between py-4 border-b border-[#1e1e1e] last:border-0">
      <div className="pr-6">
        <div className="text-sm font-medium text-[#f0ece3]">{label}</div>
        <div
          className="text-xs text-[#5a5550] mt-0.5"
          style={{ fontFamily: "DM Mono, monospace" }}
        >
          {description}
        </div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className="relative w-10 h-5 shrink-0 transition-colors duration-200"
        style={{
          borderRadius: "10px",
          backgroundColor: on ? "#e8820c" : "#1e1e1e",
        }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 bg-[#f0ece3] transition-all duration-200"
          style={{ borderRadius: "8px", left: on ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const [section, setSection] = useState<Section>("account");

  return (
    <div className="bg-[#080808] min-h-screen">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="md:hidden border-b border-[#1e1e1e] px-4 overflow-x-auto">
        <div className="flex gap-1 py-3 w-max">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`px-4 py-1.5 text-sm transition-colors whitespace-nowrap ${
                section === s.id
                  ? "bg-[#e8820c] text-[#080808] font-semibold"
                  : "text-[#5a5550] border border-[#1e1e1e] hover:text-[#a09890]"
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
        <aside className="hidden md:block w-52 shrink-0 border-r border-[#1e1e1e] p-7 sticky top-14 self-start h-[calc(100vh-56px)]">
          <h2
            className="text-xl font-bold text-[#f0ece3] mb-8"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Settings
          </h2>
          <nav className="flex flex-col gap-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`text-left px-3 py-2 text-sm transition-colors ${
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
        <main className="flex-1 px-4 py-8 md:px-12 md:py-10 max-w-2xl">
          {section === "account" && (
            <div>
              <h3
                className="text-[22px] font-bold text-[#f0ece3] mb-7 md:text-[26px] md:mb-8"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Account
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 pb-8 border-b border-[#1e1e1e]">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-[#1e1e1e] shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&auto=format"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <button
                    className="text-sm font-medium text-[#f0ece3] border border-[#2a2a2a] px-4 py-1.5 hover:border-[#4a4540] transition-colors"
                    style={{ borderRadius: "2px" }}
                  >
                    Change photo
                  </button>
                  <p
                    className="text-xs text-[#5a5550] mt-2"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    PNG or JPG, max 5MB
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First name" defaultValue="Jordan" />
                  <Field label="Last name" defaultValue="Nakamura" />
                </div>
                <Field label="Username" defaultValue="j.nakamura" />
                <Field
                  label="Email address"
                  defaultValue="jordan@nakamura.co"
                  type="email"
                />
                <Field label="Location" defaultValue="Tokyo, Japan" />
                <div>
                  <label
                    className="block text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-2"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Based in Tokyo. I collect and sell considered objects."
                    className="w-full bg-[#111] border border-[#1e1e1e] text-[#f0ece3] text-sm px-4 py-2.5 focus:outline-none focus:border-[#e8820c] transition-colors resize-none"
                    style={{
                      borderRadius: "2px",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  />
                </div>
                <button
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#e8820c] text-[#080808] text-sm font-semibold hover:bg-[#cf7108] transition-colors"
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
                className="text-[22px] font-bold text-[#f0ece3] mb-7 md:text-[26px] md:mb-8"
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
                className="text-[22px] font-bold text-[#f0ece3] mb-7 md:text-[26px] md:mb-8"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Payment
              </h3>
              <div className="mb-8 pb-8 border-b border-[#1e1e1e]">
                <h4
                  className="text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-4"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Payment methods
                </h4>
                <div
                  className="border border-[#1e1e1e] bg-[#111] p-4 flex items-center justify-between mb-3"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-6 bg-[#1a1a1a] flex items-center justify-center shrink-0"
                      style={{ borderRadius: "2px" }}
                    >
                      <span
                        className="text-[9px] text-[#f0ece3] font-bold tracking-wider"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        VISA
                      </span>
                    </div>
                    <span className="text-sm text-[#f0ece3] truncate">
                      •••• 4829
                    </span>
                    <span
                      className="text-xs text-[#5a5550] hidden sm:block"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      09/28
                    </span>
                  </div>
                  <span
                    className="text-xs text-[#e8820c] shrink-0 ml-2"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    Primary
                  </span>
                </div>
                <button
                  className="text-sm text-[#5a5550] hover:text-[#f0ece3] transition-colors"
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
                className="text-[22px] font-bold text-[#f0ece3] mb-7 md:text-[26px] md:mb-8"
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
              <div className="mt-8 pt-8 border-t border-[#1e1e1e]">
                <div className="text-sm font-medium text-[#f0ece3] mb-1">
                  Data export
                </div>
                <p
                  className="text-xs text-[#5a5550] mb-4"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Download a copy of all your MKT. data.
                </p>
                <button
                  className="text-sm border border-[#2a2a2a] text-[#f0ece3] px-4 py-2 hover:border-[#4a4540] transition-colors"
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
                className="text-[22px] font-bold text-[#f0ece3] mb-7 md:text-[26px] md:mb-8"
                style={{ fontFamily: "Fraunces, Georgia, serif" }}
              >
                Security
              </h3>
              <div className="space-y-5 mb-10 pb-10 border-b border-[#1e1e1e]">
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
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#e8820c] text-[#080808] text-sm font-semibold hover:bg-[#cf7108] transition-colors"
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
              <div className="mt-8 pt-8 border-t border-[#1e1e1e]">
                <div className="text-sm font-medium text-[#dc4040] mb-1">
                  Danger zone
                </div>
                <p
                  className="text-xs text-[#5a5550] mb-4"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  Permanently delete your account and all associated data.
                </p>
                <button
                  className="text-sm border border-[#dc4040]/30 text-[#dc4040] px-4 py-2 hover:border-[#dc4040]/70 transition-colors"
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
