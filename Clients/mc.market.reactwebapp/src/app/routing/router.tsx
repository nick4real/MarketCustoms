import { Navigate, createBrowserRouter } from "react-router";
import MainLayout from "@/app/layouts/MainLayout";
import AuthLayout from "@/app/layouts/AuthLayout";
import { routes } from "@/shared/config";
import { AccountGate } from "./AccountGate";
import { HomePage } from "@/pages/home";
import { BrowsePage } from "@/pages/browse";
import { ListingDetailsPage } from "@/pages/listing-details";
import { ProfilePage } from "@/pages/profile";
import { SettingsPage } from "@/pages/settings";
import { OrdersPage } from "@/pages/orders";
import { LoginPage } from "@/pages/login";
import { CallbackPage } from "@/pages/callback";

export const router = createBrowserRouter([
  {
    path: routes.home,
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "browse", Component: BrowsePage },
      { path: "listings/:listingId", Component: ListingDetailsPage },
      {
        Component: AccountGate,
        children: [
          { path: "profile", Component: ProfilePage },
          { path: "settings", Component: SettingsPage },
          { path: "orders", Component: OrdersPage },
          {
            path: "verify-email",
            element: <Navigate to={routes.home} replace />,
          },
        ],
      },
    ],
  },
  {
    Component: AuthLayout,
    children: [
      { path: "login", Component: LoginPage },
      { path: "callback", Component: CallbackPage },
    ],
  },
]);
