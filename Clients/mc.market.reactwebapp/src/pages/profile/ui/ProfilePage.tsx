import { useState } from "react";
import { Link, useParams } from "react-router";
import { isNotFoundError } from "@/shared/api";
import { routes } from "@/shared/config";
import { useVisitorSession } from "@/entities/session";
import { usePublicProfileQuery } from "@/entities/profile";
import { Avatar, Button, ButtonLink, StatusMessage, Tabs } from "@/shared/ui";
import { getInitials } from "@/shared/lib";
import { resolveProfileTarget } from "../lib/resolveProfileTarget";
import { ProfileListings } from "./ProfileListings";

const reviews = [
  {
    author: "T. Berg",
    rating: 5,
    date: "Aug 14, 2026",
    text: "Impeccably packed, exactly as described. Would buy from again without hesitation.",
  },
  {
    author: "M. Weiss",
    rating: 5,
    date: "Jul 28, 2026",
    text: "Fast response, honest about condition, item arrived better than expected.",
  },
  {
    author: "L. Chen",
    rating: 4,
    date: "Jul 02, 2026",
    text: "Good seller, slight delay in shipping but communicated proactively. Item was perfect.",
  },
];

type Tab = "listings" | "reviews" | "about";

const tabs: { id: Tab; label: string }[] = [
  { id: "listings", label: "listings" },
  { id: "reviews", label: "reviews" },
  { id: "about", label: "about" },
];

export function ProfilePage() {
  const { profileId: paramId } = useParams();
  const { account } = useVisitorSession();
  const { profileId, isOwn } = resolveProfileTarget(
    paramId,
    account?.profileId,
  );

  if (profileId === null) {
    return <StatusMessage size="page" message="Loading..." />;
  }

  // Keyed so tab and listings page reset when navigating between profiles.
  return <ProfileView key={profileId} profileId={profileId} isOwn={isOwn} />;
}

function ProfileView({
  profileId,
  isOwn,
}: {
  profileId: string;
  isOwn: boolean;
}) {
  const [tab, setTab] = useState<Tab>("listings");
  const { account } = useVisitorSession();
  const profileQuery = usePublicProfileQuery(profileId);

  if (isNotFoundError(profileQuery.error)) {
    return (
      <StatusMessage size="page" symbol="∅" message="Profile not found">
        <ButtonLink to={routes.browse} size="lg">
          Back to Browse
        </ButtonLink>
      </StatusMessage>
    );
  }

  if (profileQuery.isPending) {
    return <StatusMessage size="page" message="Loading..." />;
  }

  if (profileQuery.isError) {
    return (
      <StatusMessage
        size="page"
        symbol="Whoops!"
        message="Error loading profile"
      />
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="bg-background">
      {/* Cover */}
      <div className="bg-surface relative h-36 overflow-hidden md:h-52">
        <img
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=500&fit=crop&auto=format"
          alt="Cover"
          className="h-full w-full object-cover opacity-25"
        />
        <div className="from-background via-background/40 absolute inset-0 bg-linear-to-t to-transparent" />
      </div>

      <div className="px-4 md:px-12 lg:px-16">
        {/* Profile header */}
        <div className="relative z-10 -mt-10 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end md:-mt-14">
          <Avatar
            size="xl"
            src={profile.pictureUrl ?? (isOwn ? account?.photoUrl : null)}
            initials={getInitials(profile.displayName)}
          />

          <div className="flex-1 sm:pb-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-foreground font-display text-[24px] leading-none font-bold md:text-[28px]">
                {profile.displayName}
              </h1>
              {isOwn &&
                (account?.emailVerified ? (
                  <span className="bg-primary text-primary-foreground rounded-xs px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider">
                    VERIFIED
                  </span>
                ) : (
                  <>
                    <span className="border-border text-muted-foreground rounded-xs border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider">
                      UNVERIFIED
                    </span>
                    <Link
                      to={routes.settings}
                      className="text-primary font-mono text-xs"
                    >
                      Verify email
                    </Link>
                  </>
                ))}
            </div>
            {isOwn && account?.email && (
              <p className="text-muted-foreground font-mono text-xs">
                {account.email}
              </p>
            )}
          </div>

          <div className="flex gap-2 self-start sm:gap-3 sm:self-auto sm:pb-1">
            <Button variant="outline">Message</Button>
            <Button variant="primary">Follow</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="border-border grid grid-cols-2 gap-5 border-b pb-6 sm:flex sm:items-center sm:gap-10 lg:gap-12">
          {[
            { value: "4.97", label: "Rating", sub: "89 reviews" },
            { value: "142", label: "Sales", sub: "all time" },
            { value: "6", label: "Active", sub: "listings" },
            { value: "98%", label: "Response", sub: "< 2h avg" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="flex items-baseline gap-2">
                <span className="text-foreground font-display text-[22px] leading-none font-bold md:text-[26px]">
                  {stat.value}
                </span>
                <span className="text-muted-foreground font-mono text-xs">
                  {stat.label}
                </span>
              </div>
              <div className="text-foreground-subtle mt-0.5 font-mono text-[10px]">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs
          className="mb-6 overflow-x-auto pt-5"
          items={tabs}
          value={tab}
          onChange={setTab}
        />

        {/* Listings */}
        {tab === "listings" && <ProfileListings ownerId={profileId} />}

        {/* Reviews */}
        {tab === "reviews" && (
          <div className="max-w-2xl space-y-4 pb-16">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="border-border bg-card rounded-xs border p-5 md:p-6"
              >
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" initials={r.author[0] ?? ""} />
                    <span className="text-foreground text-sm font-medium">
                      {r.author}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span
                          key={j}
                          className={`text-sm ${j < r.rating ? "text-primary" : "text-border-subtle"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-muted-foreground font-mono text-xs">
                      {r.date}
                    </span>
                  </div>
                </div>
                <p className="text-foreground-dim text-sm leading-relaxed font-light">
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* About */}
        {tab === "about" && (
          <div className="max-w-lg pb-16">
            <p className="text-foreground-dim text-[15px] leading-relaxed font-light">
              {profile.bio ?? "No bio yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
