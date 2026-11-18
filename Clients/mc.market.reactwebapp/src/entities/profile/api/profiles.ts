import type {
  AccountType,
  CurrentUserMetadata,
  PublicProfile,
} from "../model/types";
import { HttpError, readResponse } from "@/shared/api";
import { readBoolean, readStringNonEmpty } from "@/shared/lib";

/* Profiles API */
const metadataUrl = "/api/profiles/me/current-user-metadata";
const clarifyAccountTypeUrl = "/api/profiles/me/clarify-account-type";

/* Maps */
export function mapCurrentUserMetadata(body: unknown): CurrentUserMetadata {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid profile metadata");
  }

  const row = body as Record<string, unknown>;
  const id = readStringNonEmpty(row.id);
  const displayName = readStringNonEmpty(row.displayName);
  const accountType = readStringNonEmpty(row.accountType);
  if (!id || !displayName || !accountType) {
    throw new Error("Invalid profile metadata");
  }

  return {
    id,
    displayName,
    pictureUrl: readStringNonEmpty(row.pictureUrl),
    accountType,
  };
}

export function mapPublicProfile(body: unknown): PublicProfile {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid public profile");
  }

  const row = body as Record<string, unknown>;
  const id = readStringNonEmpty(row.id);
  const displayName = readStringNonEmpty(row.displayName);
  const isSeller = readBoolean(row.isSeller);
  if (!id || !displayName || isSeller === null) {
    throw new Error("Invalid public profile");
  }

  return {
    id,
    displayName,
    bio: readStringNonEmpty(row.bio),
    pictureUrl: readStringNonEmpty(row.pictureUrl),
    isSeller,
  };
}

/* API */
export async function getPublicProfile(
  id: string,
  signal?: AbortSignal,
): Promise<PublicProfile> {
  const response = await fetch(`/api/profiles/${encodeURIComponent(id)}`, {
    signal,
  });

  return mapPublicProfile(
    await readResponse(response, "Public profile request"),
  );
}

export async function ensureCurrentUserMetadata(
  accessToken: string,
  input: { displayName: string; pictureUrl: string | null },
  signal?: AbortSignal,
): Promise<CurrentUserMetadata> {
  const response = await fetch(metadataUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      displayName: input.displayName,
      pictureUrl: input.pictureUrl,
    }),
    signal,
  });

  return mapCurrentUserMetadata(
    await readResponse(response, "Profile metadata request"),
  );
}

export async function clarifyAccountType(
  accessToken: string,
  accountType: AccountType,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(clarifyAccountTypeUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accountType }),
    signal,
  });

  if (!response.ok) {
    throw new HttpError(
      response.status,
      `Account type request failed (${response.status})`,
    );
  }
}
