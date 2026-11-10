import { HttpError } from "@/shared/lib/httpError";

export function readFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

export function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function readPositiveInt(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

export function readStringNonEmpty(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function readResponse(
  response: Response,
  action: string,
): Promise<unknown> {
  if (!response.ok) {
    throw new HttpError(
      response.status,
      `${action} failed (${response.status})`,
    );
  }
  return await response.json();
}
