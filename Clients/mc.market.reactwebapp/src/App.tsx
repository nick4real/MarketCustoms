import { Auth0Provider } from "@auth0/auth0-react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { getAuth0ProviderOptions, isAuth0Configured } from "./auth/auth0";
import { destinationAfterSignIn } from "./auth/afterSignIn";
import { mapAccount, type Auth0UserLike } from "./auth/mapAccount";
import {
  Auth0VisitorSessionProvider,
  ProvideVisitorSession,
  missingConfigSession,
} from "./auth/useVisitorSession";

function onRedirectCallback(
  appState?: { returnTo?: string },
  user?: Auth0UserLike,
) {
  void router.navigate(
    destinationAfterSignIn(appState?.returnTo, mapAccount(user)),
    { replace: true },
  );
}

export default function App() {
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
