import type { AccountView } from "@/features/auth/types/session";
import { emailVerificationPath, isPublicStorefrontPath, sanitizeReturnTo } from "./paths";

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
