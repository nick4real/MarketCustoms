import type { CurrentUserMetadata } from "@/entities/profile/model/types";
import { readResponse, readStringNonEmpty } from "@/shared/lib/readJson";

/* Profiles API */
const metadataUrl = "/api/profiles/me/current-user-metadata";

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

/* API */
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
    readResponse(response, "Profile metadata request"),
  );
}
