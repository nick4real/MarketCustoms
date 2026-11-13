import { useId, useState } from "react";
import { useVisitorSession } from "@/entities/session";
import { Avatar, Button, Eyebrow } from "@/shared/ui";
import { cx, getInitials } from "@/shared/lib";

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
  const id = useId();
  const [val, setVal] = useState(defaultValue);
  return (
    <div>
      <label
        htmlFor={id}
        className="text-muted-foreground mb-2 block font-mono text-[10px] tracking-[0.15em] uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="border-border bg-card text-foreground focus:border-primary w-full rounded-xs border px-4 py-2.5 text-sm transition-colors focus:outline-none"
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
        <div className="text-muted-foreground mt-0.5 font-mono text-xs">
          {description}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn(!on)}
        className={cx(
          "relative h-5 w-10 shrink-0 rounded-full transition-colors duration-200",
          on ? "bg-primary" : "bg-border",
        )}
      >
        <div
          className={cx(
            "bg-foreground absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

function EmailVerificationNotice({ email }: { email: string | null }) {
  return (
    <div className="border-border bg-card mb-8 rounded-xs border p-4 md:p-5">
      <p className="text-muted-foreground text-sm font-medium">
        {email ? (
          <>
            Your email <span className="text-foreground">{email}</span> isn't
            verified yet.
          </>
        ) : (
          "Your email isn't verified yet."
        )}
      </p>
      <p className="text-muted-foreground mt-1 mb-4 font-mono text-xs">
        Verify your email to unlock orders.
      </p>
      <Button variant="outline" size="sm" disabled>
        Resend verification email
      </Button>
      <p className="text-muted-foreground mt-2 font-mono text-xs">
        Coming soon
      </p>
    </div>
  );
}

export function SettingsPage() {
  const [section, setSection] = useState<Section>("account");
  const { account } = useVisitorSession();
  const displayName = account?.displayName ?? "";
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
  const username = account?.email?.split("@")[0] ?? "";
  const email = account?.email ?? "";
  const initials = getInitials(account?.displayName, account?.email);

  return (
    <div className="bg-background">
      {/* Mobile: horizontal scrollable tabs */}
      <div className="border-border overflow-x-auto border-b px-4 md:hidden">
        <div className="flex w-max gap-1 py-3">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cx(
                "rounded-xs px-4 py-1.5 text-sm whitespace-nowrap transition-colors",
                section === s.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border-border text-muted-foreground hover:text-foreground-muted border",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="border-border sticky top-14 hidden h-[calc(100vh-56px)] w-52 shrink-0 self-start border-r p-7 md:block">
          <h2 className="text-foreground font-display mb-8 text-xl font-bold">
            Settings
          </h2>
          <nav className="flex flex-col gap-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cx(
                  "rounded-xs px-3 py-2 text-left text-sm transition-colors",
                  section === s.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground-muted",
                )}
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
              <h3 className="text-foreground font-display mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]">
                Account
              </h3>

              {account?.emailVerified === false && (
                <EmailVerificationNotice email={account.email} />
              )}

              <div className="border-border mb-8 flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-center">
                <Avatar size="lg" src={account?.photoUrl} initials={initials} />
                <div>
                  <Button variant="outline" size="sm">
                    Change photo
                  </Button>
                  <p className="text-muted-foreground mt-2 font-mono text-xs">
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
                    htmlFor="settings-bio"
                    className="text-muted-foreground mb-2 block font-mono text-[10px] tracking-[0.15em] uppercase"
                  >
                    Bio
                  </label>
                  <textarea
                    id="settings-bio"
                    rows={3}
                    defaultValue="Based in Tokyo. I collect and sell considered objects."
                    className="border-border bg-card text-foreground focus:border-primary w-full resize-none rounded-xs border px-4 py-2.5 text-sm transition-colors focus:outline-none"
                  />
                </div>
                <Button variant="primary" className="w-full sm:w-auto">
                  Save changes
                </Button>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div>
              <h3 className="text-foreground font-display mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]">
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
              <h3 className="text-foreground font-display mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]">
                Payment
              </h3>
              <div className="border-border mb-8 border-b pb-8">
                <Eyebrow as="h4" className="mb-4">
                  Payment methods
                </Eyebrow>
                <div className="border-border bg-card mb-3 flex items-center justify-between rounded-xs border p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="bg-secondary flex h-6 w-10 shrink-0 items-center justify-center rounded-xs">
                      <span className="text-foreground font-mono text-[9px] font-bold tracking-wider">
                        VISA
                      </span>
                    </div>
                    <span className="text-foreground truncate text-sm">
                      •••• 4829
                    </span>
                    <span className="text-muted-foreground hidden font-mono text-xs sm:block">
                      09/28
                    </span>
                  </div>
                  <span className="text-primary ml-2 shrink-0 font-mono text-xs">
                    Primary
                  </span>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground font-mono text-sm transition-colors"
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
              <h3 className="text-foreground font-display mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]">
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
                <p className="text-muted-foreground mb-4 font-mono text-xs">
                  Download a copy of all your MKT. data.
                </p>
                <Button variant="outline">Request export</Button>
              </div>
            </div>
          )}

          {section === "security" && (
            <div>
              <h3 className="text-foreground font-display mb-7 text-[22px] font-bold md:mb-8 md:text-[26px]">
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
                <Button variant="primary" className="w-full sm:w-auto">
                  Update password
                </Button>
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
                <p className="text-muted-foreground mb-4 font-mono text-xs">
                  Permanently delete your account and all associated data.
                </p>
                <Button variant="danger" disabled>
                  Delete account
                </Button>
                <p className="text-muted-foreground mt-2 font-mono text-xs">
                  Coming soon
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
