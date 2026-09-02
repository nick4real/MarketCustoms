import type { AuthPageMode } from "./authPageMode";
import { sanitizeReturnTo } from "./returnTo";

export type HostedLoginRedirect = (options: {
  appState: { returnTo: string };
  authorizationParams?: { screen_hint: "signup" };
}) => Promise<void>;

export function buildHostedLoginOptions(
  mode: AuthPageMode,
  returnTo?: string | null,
): {
  appState: { returnTo: string };
  authorizationParams?: { screen_hint: "signup" };
} {
  const sanitized = sanitizeReturnTo(returnTo);
  if (mode === "sign-up") {
    return {
      appState: { returnTo: sanitized },
      authorizationParams: { screen_hint: "signup" },
    };
  }
  return { appState: { returnTo: sanitized } };
}

// Delegated function to start the hosted login flow
export async function startHostedLogin(
  loginWithRedirect: HostedLoginRedirect,
  mode: AuthPageMode,
  returnTo?: string | null,
): Promise<void> {
  await loginWithRedirect(buildHostedLoginOptions(mode, returnTo));
}
