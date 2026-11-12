import { Outlet } from "react-router";
import { SiteFooter } from "@/widgets/footer";
import { SiteHeader } from "@/widgets/site-header";

export default function MainLayout() {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <SiteHeader />
      {/* Flex column so pages can fill the space above the footer with flex-1. */}
      <div className="flex flex-1 flex-col pt-14">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
