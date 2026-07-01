import { useState } from "react";
import General from "../components/dashboard/General";
import MyProducts from "../components/dashboard/MyProducts";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <>
      <aside className="border w-64 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <ul>
          <li onClick={() => setActiveTab("general")}>
            {activeTab === "general" ? "> " : "  "} General
          </li>
          <li onClick={() => setActiveTab("myOrders")}>
            {activeTab === "myOrders" ? "> " : "  "} My Orders
          </li>
          <li onClick={() => setActiveTab("myProducts")}>
            {activeTab === "myProducts" ? "> " : "  "} My Products
          </li>
          <li onClick={() => setActiveTab("settings")}>
            {activeTab === "settings" ? "> " : "  "} Settings
          </li>
        </ul>
      </aside>

      <div className="border grow">
        {activeTab === "general" && <General />}
        {activeTab === "myProducts" && <MyProducts />}
      </div>
    </>
  );
}

export default Dashboard;
