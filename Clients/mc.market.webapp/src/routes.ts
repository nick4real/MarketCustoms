import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ListingDetails from "./pages/ListingDetails";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Orders from "./pages/Orders";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "browse", Component: Browse },
      { path: "listings/:listingId", Component: ListingDetails },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
      { path: "orders", Component: Orders },
    ],
  },
]);
