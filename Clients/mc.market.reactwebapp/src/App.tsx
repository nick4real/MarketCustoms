import { Auth0Provider } from "@auth0/auth0-react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { getAuth0ProviderOptions, isAuth0Configured } from "./auth/auth0";
import { savePostSignInReturnTo } from "./auth/postSignInReturnTo";
import {
  Auth0VisitorSessionProvider,
  ProvideVisitorSession,
  missingConfigSession,
} from "./auth/useVisitorSession";

// Stay on /callback until the session provider has profile metadata.
function onRedirectCallback(appState?: { returnTo?: string }) {
  savePostSignInReturnTo(appState?.returnTo);
  void router.navigate("/callback", { replace: true });
}

// Main App component
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
