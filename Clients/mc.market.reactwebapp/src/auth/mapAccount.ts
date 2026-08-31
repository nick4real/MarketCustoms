import type { AccountView } from "../models/session";

export type Auth0UserLike = {
  sub?: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
};

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function mapAccount(
  user: Auth0UserLike | null | undefined,
): AccountView | null {
  const subject = nonEmpty(user?.sub);
  if (!user || !subject) {
    return null;
  }

  const emailVerified = user.email_verified !== false;
  return {
    subject,
    displayName: nonEmpty(user.name) ?? nonEmpty(user.nickname),
    email: nonEmpty(user.email),
    photoUrl: nonEmpty(user.picture),
    emailVerified,
    isFullyUsable: emailVerified,
  };
}
