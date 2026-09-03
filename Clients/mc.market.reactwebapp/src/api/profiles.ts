import type { CurrentUserMetadata } from "../models/profile";

const metadataUrl = "/api/profiles/me/current-user-metadata";

function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function mapCurrentUserMetadata(body: unknown): CurrentUserMetadata {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid profile metadata");
  }

  const row = body as Record<string, unknown>;
  const id = nonEmpty(row.id);
  const displayName = nonEmpty(row.displayName);
  const accountType = nonEmpty(row.accountType);
  if (!id || !displayName || !accountType) {
    throw new Error("Invalid profile metadata");
  }

  return {
    id,
    displayName,
    pictureUrl: nonEmpty(row.pictureUrl),
    accountType,
  };
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

  if (!response.ok) {
    throw new Error(`Profile metadata request failed (${response.status})`);
  }

  return mapCurrentUserMetadata(await response.json());
}
