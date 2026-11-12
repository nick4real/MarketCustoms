export const routes = {
  home: "/",
  browse: "/browse",
  listing: (id: string) => `/listings/${encodeURIComponent(id)}`,
  browseCategory: (categoryId: number) => `/browse?categoryId=${categoryId}`,
  profile: "/profile",
  orders: "/orders",
  settings: "/settings",
  verifyEmail: "/verify-email",
  login: "/login",
  callback: "/callback",
} as const;

export const accountPaths = [
  routes.profile,
  routes.orders,
  routes.settings,
] as const;
