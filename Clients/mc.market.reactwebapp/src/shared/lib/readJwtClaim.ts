/** Decodes a JWT payload claim for display logic only; the signature is never checked. */
export function readJwtClaim(token: string, claim: string): unknown {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return undefined;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!payload || typeof payload !== "object") {
      return undefined;
    }
    return (payload as Record<string, unknown>)[claim];
  } catch {
    return undefined;
  }
}
