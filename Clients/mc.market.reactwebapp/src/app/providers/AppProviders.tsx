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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function onRedirectCallback(appState?: { returnTo?: string }) {
  savePostSignInReturnTo(appState?.returnTo);
  void router.navigate("/callback", { replace: true });
}

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <Auth0VisitorSessionProvider>
          <RouterProvider router={router} />
        </Auth0VisitorSessionProvider>
      </QueryClientProvider>
    </Auth0Provider>
  );
}
