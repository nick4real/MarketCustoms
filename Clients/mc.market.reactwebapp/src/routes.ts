import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AccountGate from "./auth/AccountGate";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ListingDetails from "./pages/ListingDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Callback from "./pages/Callback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "browse", Component: Browse },
      { path: "listings/:listingId", Component: ListingDetails },
      {
        Component: AccountGate,
        children: [
          { path: "profile", Component: Profile },
          { path: "settings", Component: Settings },
          { path: "orders", Component: Orders },
        ],
      },
    ],
  },
  {
    Component: AuthLayout,
    children: [
      { path: "login", Component: Login },
      { path: "callback", Component: Callback },
    ],
  },
]);
