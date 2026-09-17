import { Auth0Provider } from "@auth0/auth0-react";
import { RouterProvider } from "react-router";
import { router } from "@/app/routes";
import {
  Auth0VisitorSessionProvider,
  ProvideVisitorSession,
  missingConfigSession,
  savePostSignInReturnTo,
} from "@/features/visitor-session";
import {
  getAuth0ProviderOptions,
  isAuth0Configured,
} from "@/features/visitor-session";

function onRedirectCallback(appState?: { returnTo?: string }) {
  savePostSignInReturnTo(appState?.returnTo);
  void router.navigate("/callback", { replace: true });
}

export default function AppProviders() {
  if (!isAuth0Configured) {
    return (
      <ProvideVisitorSession session={missingConfigSession}>
        <RouterProvider router={router} />
      </ProvideVisitorSession>
    );
  }

  return (
    <Auth0Provider
      {...getAuth0ProviderOptions()}
      onRedirectCallback={onRedirectCallback}
    >
      <Auth0VisitorSessionProvider>
        <RouterProvider router={router} />
      </Auth0VisitorSessionProvider>
    </Auth0Provider>
  );
}
