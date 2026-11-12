import { Outlet } from "react-router";
import { SiteHeader } from "@/widgets/site-header";

export default function MainLayout() {
  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <div className="pt-14">
        <Outlet />
      </div>
    </div>
  );
}
