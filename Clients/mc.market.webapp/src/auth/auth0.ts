const logoutUri = `${globalThis.location.origin}/`;

const scope = ["openid", "profile", "email", "phone"].join(" ");

const domain = import.meta.env.VITE_AUTH0_DOMAIN as string | undefined;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID as string | undefined;
const authorizationParams = {
  redirect_uri: logoutUri,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined,
  scope: scope,
};

export const auth0Config = {
  domain: domain,
  clientId: clientId,
  cacheLocation: "localstorage",
  authorizationParams: authorizationParams,
  logoutReturnTo: logoutUri,
} as const;
