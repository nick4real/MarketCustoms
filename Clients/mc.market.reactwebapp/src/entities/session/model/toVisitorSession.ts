import { mapAccount, type Auth0UserLike } from "../lib/mapAccount";
import { mapSessionError } from "../lib/sessionError";
import type { AccountView, VisitorSessionView } from "./types";
import { readStringNonEmpty } from "@/shared/lib";

export interface SessionProfile {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  accountType: string;
}

export type ProfileLoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; metadata: SessionProfile }
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
  metadata: SessionProfile,
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
