import { useState } from "react";
import { Link } from "react-router";
import General from "../components/dashboard/General";
import MyProducts from "../components/dashboard/MyProducts";
import { useOnboarding } from "../auth/OnboardingGate";

const tabs = [
  { id: "general", label: "General" },
  { id: "myOrders", label: "My Orders" },
  { id: "myProducts", label: "My Products" },
  { id: "settings", label: "Settings" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const onboarding = useOnboarding();

  return (
    <div className="flex w-full flex-col gap-6 px-4 py-8 sm:flex-row sm:px-6">
      <aside className="w-full shrink-0 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:w-64">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Dashboard
        </h1>
        {onboarding?.isVerified && (
          <Link
            to="/profile/seller"
            className="mt-3 block rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-zinc-900"
          >
            {onboarding.isSeller ? "View seller profile" : "Become a seller"}
          </Link>
        )}
        <ul className="mt-4 flex flex-row gap-2 overflow-x-auto sm:flex-col sm:gap-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-amber-500 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-h-[400px] flex-1 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {activeTab === "general" && <General />}
        {activeTab === "myProducts" && <MyProducts />}
        {activeTab === "myOrders" && (
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              My Orders
            </h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Order history will appear here once the ordering service is
              connected.
            </p>
          </div>
        )}
        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Settings
            </h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Account and notification settings coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
