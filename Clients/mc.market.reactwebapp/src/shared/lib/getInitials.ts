const FALLBACK_INITIALS = "MC";

function toWords(value: string | null | undefined): string[] {
  const trimmed = (value ?? "").trim();
  if (!trimmed) {
    return [];
  }
  // An email-like value contributes only its local part.
  const source = trimmed.includes("@") ? trimmed.split("@")[0] : trimmed;
  return source.replace(/\./g, "").split(/\s+/).filter(Boolean);
}

export function getInitials(
  name?: string | null,
  email?: string | null,
): string {
  const words = toWords(name);
  const parts = words.length > 0 ? words : toWords(email);
  if (parts.length === 0) {
    return FALLBACK_INITIALS;
  }
  const first = parts[0];
  const initials =
    parts.length === 1
      ? first.slice(0, 2)
      : first[0] + parts[parts.length - 1][0];
  return initials.toUpperCase();
}
