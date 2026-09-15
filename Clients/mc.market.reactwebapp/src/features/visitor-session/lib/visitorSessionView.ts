import type { CurrentUserMetadata } from "@/entities/profile";
import {
  mapAccount,
  mapSessionError,
  type AccountView,
  type Auth0UserLike,
  type VisitorSessionView,
} from "@/entities/session";
import { readStringNonEmpty } from "@/shared";

export type ProfileLoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; metadata: CurrentUserMetadata }
  | { status: "error" };

export const missingConfigSession: VisitorSessionView = {
  status: "guest",
  account: null,
  error: mapSessionError({ missingConfig: true }),
};

function profileStateForSession(
  isAuthenticated: boolean,
  profile: ProfileLoadState | undefined,
): ProfileLoadState {
  if (profile) {
    return profile;
  }
  return isAuthenticated ? { status: "loading" } : { status: "idle" };
}

function applyProfileMetadata(
  account: AccountView,
  metadata: CurrentUserMetadata,
): AccountView {
  return {
    ...account,
    displayName:
      readStringNonEmpty(metadata.displayName) ?? account.displayName,
    photoUrl: readStringNonEmpty(metadata.pictureUrl),
    profileId: readStringNonEmpty(metadata.id),
    accountType: readStringNonEmpty(metadata.accountType),
  };
}

export function toVisitorSession(input: {
  isConfigured: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: Auth0UserLike | undefined;
  error: unknown;
  profile?: ProfileLoadState;
}): VisitorSessionView {
  if (!input.isConfigured) {
    return missingConfigSession;
  }

  if (input.error) {
    return {
      status: "guest",
      account: null,
      error: mapSessionError({ auth0Error: input.error }),
    };
  }

  if (input.isLoading) {
    return { status: "authenticating", account: null, error: null };
  }

  if (input.isAuthenticated) {
    const account = mapAccount(input.user);
    if (!account) {
      return {
        status: "guest",
        account: null,
        error: mapSessionError({ callbackFailed: true }),
      };
    }

    const profile = profileStateForSession(
      input.isAuthenticated,
      input.profile,
    );
    if (profile.status === "idle" || profile.status === "loading") {
      return { status: "authenticating", account: null, error: null };
    }
    if (profile.status === "error") {
      return {
        status: "guest",
        account: null,
        error: mapSessionError({ profileFailed: true }),
      };
    }

    return {
      status: "signed-in",
      account: applyProfileMetadata(account, profile.metadata),
      error: null,
    };
  }

  return { status: "guest", account: null, error: null };
}
