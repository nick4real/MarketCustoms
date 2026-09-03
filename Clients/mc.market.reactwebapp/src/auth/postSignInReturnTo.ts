import { sanitizeReturnTo } from "./returnTo";

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
