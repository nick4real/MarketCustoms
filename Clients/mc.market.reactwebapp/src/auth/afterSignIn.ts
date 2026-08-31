import type { AccountView } from "../models/session";
import {
  emailVerificationPath,
  isPublicStorefrontPath,
  sanitizeReturnTo,
} from "./returnTo";

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
