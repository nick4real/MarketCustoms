import type { ReactNode } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import {
  SessionContextProvider,
  missingConfigSession,
} from "@/entities/session";
import { savePostSignInReturnTo } from "@/features/auth";
import {
  getAuth0ProviderOptions,
  isAuth0Configured,
  routes,
} from "@/shared/config";
import { router } from "../routing/router";
import { SessionProvider } from "./SessionProvider";

function onRedirectCallback(appState?: { returnTo?: string }) {
  savePostSignInReturnTo(appState?.returnTo);
  void router.navigate(routes.callback, { replace: true });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!isAuth0Configured) {
    return (
      <SessionContextProvider session={missingConfigSession}>
        {children}
      </SessionContextProvider>
    );
  }

  return (
    <Auth0Provider
      {...getAuth0ProviderOptions()}
      onRedirectCallback={onRedirectCallback}
    >
      <SessionProvider>{children}</SessionProvider>
    </Auth0Provider>
  );
}
