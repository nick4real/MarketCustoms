import type { CurrentUserMetadata } from "../models/profile";
import type { AccountView } from "../models/session";

export type Auth0UserLike = {
  sub?: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
};

function nonEmpty(value: string | null | undefined): string | null {
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
    profileId: null,
    accountType: null,
  };
}

export function displayNameForProfileEnsure(account: AccountView): string {
  return account.displayName ?? "New member";
}

export function applyProfileMetadata(
  account: AccountView,
  metadata: CurrentUserMetadata,
): AccountView {
  return {
    ...account,
    displayName: nonEmpty(metadata.displayName) ?? account.displayName,
    photoUrl: nonEmpty(metadata.pictureUrl),
    profileId: nonEmpty(metadata.id),
    accountType: nonEmpty(metadata.accountType),
  };
}
