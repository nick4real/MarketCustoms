import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from "./pages/Dashboard";
import ClarifyProfile from "./pages/ClarifyProfile";
import SellerApplication from "./pages/SellerApplication";

function App() {
  useEffect(() => {
    const body = document.body;
    const root = document.getElementById("root");

    body.classList.add(
      "bg-white",
      "text-black",
      "dark:bg-neutral-950",
      "dark:text-white",
      "overflow-x-hidden",
      "min-h-screen",
    );

    root?.classList.add("w-full", "flex", "flex-col", "min-w-[320px]", "min-h-screen");

    return () => {
      body.classList.remove(
        "bg-white",
        "text-black",
        "dark:bg-neutral-950",
        "dark:text-white",
        "overflow-x-hidden",
        "min-h-screen",
      );
      root?.classList.remove("w-full", "flex", "flex-col", "min-w-[320px]", "min-h-screen");
    };
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <MainLayout>
          <Home />
        </MainLayout>
      ),
    },
    {
      path: "/browse",
      element: (
        <MainLayout>
          <Browse />
        </MainLayout>
      ),
    },
    {
      path: "/products/:id",
      element: (
        <MainLayout>
          <ProductDetail />
        </MainLayout>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      ),
    },
    {
      path: "/profile/clarify",
      element: (
        <MainLayout>
          <ClarifyProfile />
        </MainLayout>
      ),
    },
    {
      path: "/profile/seller",
      element: (
        <MainLayout>
          <SellerApplication />
        </MainLayout>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
