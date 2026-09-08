export const emailVerificationPath = "/verify-email";

const EXACT_PATHS = new Set([
  "/",
  "/browse",
  "/profile",
  "/orders",
  "/settings",
  emailVerificationPath,
]);

function pathAndQuery(value: string): { path: string; query: string } {
  const queryIndex = value.indexOf("?");
  if (queryIndex === -1) {
    return { path: value, query: "" };
  }
  return {
    path: value.slice(0, queryIndex),
    query: value.slice(queryIndex + 1),
  };
}

function isAllowedPath(path: string): boolean {
  if (EXACT_PATHS.has(path)) {
    return true;
  }
  const listingMatch = /^\/listings\/([^/]+)$/.exec(path);
  return Boolean(listingMatch?.[1]);
}

export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value) {
    return "/";
  }

  if (value.includes("\\") || /%2f/i.test(value) || /%5c/i.test(value)) {
    return "/";
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return "/";
  }

  if (
    decoded.includes("\\") ||
    decoded.includes("//") ||
    /[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)
  ) {
    return "/";
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) {
    return "/";
  }

  const { path, query } = pathAndQuery(decoded);
  if (query.includes("//") || /%2f/i.test(query) || /%5c/i.test(query)) {
    return "/";
  }

  if (
    path === "/login" ||
    path === "/callback" ||
    path.startsWith("/login/") ||
    path.startsWith("/callback/")
  ) {
    return "/";
  }

  if (!isAllowedPath(path)) {
    return "/";
  }

  return query ? `${path}?${query}` : path;
}

export function isPublicStorefrontPath(value: string): boolean {
  const path = pathAndQuery(sanitizeReturnTo(value)).path;
  return path === "/" || path === "/browse" || path.startsWith("/listings/");
}

export const postSignInReturnToKey = "mc.postSignInReturnTo";

function sessionStore(): Storage | null {
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

export function savePostSignInReturnTo(
  returnTo: string | null | undefined,
): void {
  sessionStore()?.setItem(postSignInReturnToKey, sanitizeReturnTo(returnTo));
}

export function takePostSignInReturnTo(): string {
  const store = sessionStore();
  const stored = store?.getItem(postSignInReturnToKey);
  store?.removeItem(postSignInReturnToKey);
  return sanitizeReturnTo(stored);
}

import type { AccountView } from "@/features/auth/types/session";

// Function to normalize the destination path after sign in
export function destinationAfterSignIn(
  returnTo: string | null | undefined,
  account: Pick<AccountView, "isFullyUsable"> | null,
): string {
  const sanitized = sanitizeReturnTo(returnTo);

  if (account && !account.isFullyUsable) {
    return isPublicStorefrontPath(sanitized)
      ? emailVerificationPath
      : sanitized;
  }

  return sanitized;
}
