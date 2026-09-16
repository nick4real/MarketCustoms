import type { AccountView } from "@/entities/session/model/types";
import { readStringNonEmpty } from "@/shared/lib/readJson";

export type Auth0UserLike = {
  sub?: string;
  name?: string;
  nickname?: string;
  email?: string;
  picture?: string;
  email_verified?: boolean;
};

export function mapAccount(
  user: Auth0UserLike | null | undefined,
): AccountView | null {
  if (!user) {
    return null;
  }
  const subject = readStringNonEmpty(user.sub);
  if (!subject) {
    return null;
  }

  const emailVerified = user.email_verified !== false;
  return {
    subject,
    displayName:
      readStringNonEmpty(user.name) ?? readStringNonEmpty(user.nickname),
    email: readStringNonEmpty(user.email),
    photoUrl: readStringNonEmpty(user.picture),
    emailVerified,
    isFullyUsable: emailVerified,
    profileId: null,
    accountType: null,
  };
}
