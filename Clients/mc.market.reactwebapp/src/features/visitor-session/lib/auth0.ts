const scope = ["openid", "profile", "email", "phone"].join(" ");

const domain = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined;

export const isAuth0Configured = Boolean(domain?.trim() && clientId?.trim());

function originPath(path: string): string {
  return `${globalThis.location.origin}${path}`;
}

export const logoutReturnTo = (): string => originPath("/");

export function getAuth0ProviderOptions(): {
  domain: string;
  clientId: string;
  cacheLocation: "localstorage";
  useRefreshTokens: true;
  useRefreshTokensFallback: true;
  authorizationParams: {
    redirect_uri: string;
    audience: string | undefined;
    scope: string;
  };
} {
  if (!isAuth0Configured || !domain || !clientId) {
    throw new Error("Auth0 is not configured");
  }

  return {
    domain,
    clientId,
    cacheLocation: "localstorage",
    useRefreshTokens: true,
    useRefreshTokensFallback: true,
    authorizationParams: {
      redirect_uri: originPath("/callback"),
      audience,
      scope,
    },
  };
}
