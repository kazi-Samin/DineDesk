"use client";

import { useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";

interface RestaurantItem {
  id: string;
  name: string;
  cuisine: string;
  area: string;
  owner: string;
  phone: string;
  status: "verified" | "pending_review" | "suspended";
  monthlyOrders: number;
}

const INITIAL_RESTAURANTS: RestaurantItem[] = [
  {
    id: "rest-1",
    name: "The Maple & Vine",
    cuisine: "Contemporary American & Steaks",
    area: "Corktown, Detroit",
    owner: "Marcus Vance (General Manager)",
    phone: "(313) 555-0142",
    status: "verified",
    monthlyOrders: 2840,
  },
  {
    id: "rest-2",
    name: "Midtown Bistro & Grill",
    cuisine: "Continental & Hearth Grill",
    area: "Midtown, Detroit",
    owner: "Farhan Ahmed",
    phone: "(313) 555-0155",
    status: "verified",
    monthlyOrders: 2190,
  },
  {
    id: "rest-3",
    name: "Eastern Market Deli Ghar",
    cuisine: "Smoked Meats & Deli",
    area: "Eastern Market, Detroit",
    owner: "Jordan Miller",
    phone: "(313) 555-0166",
    status: "pending_review",
    monthlyOrders: 0,
  },
  {
    id: "rest-4",
    name: "The Brass Spoon",
    cuisine: "Modern American Fusion",
    area: "Downtown Detroit",
    owner: "Zachary Vance",
    phone: "(313) 555-0177",
    status: "verified",
    monthlyOrders: 1870,
  },
  {
    id: "rest-5",
    name: "SmashCraft Burger Studio",
    cuisine: "Artisanal Burgers",
    area: "Midtown, Detroit",
    owner: "Thomas Hayes",
    phone: "(313) 555-0188",
    status: "verified",
    monthlyOrders: 1720,
  },
  {
    id: "rest-6",
    name: "Chowdhury Khana Khazana",
    cuisine: "Bengali Traditional",
    area: "Uttara Sector 7",
    owner: "Aminul Chowdhury",
    phone: "+880 1912-889900",
    status: "pending_review",
    monthlyOrders: 0,
  },
];

export default function AdminRestaurantsPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_admin_sidebar");
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>(INITIAL_RESTAURANTS);
  const [filter, setFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApprove = (id: string, name: string) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "verified" } : r))
    );
    showToast(`Approved & Verified license for "${name}"`);
  };

  const filtered = restaurants.filter((r) => {
    if (filter === "pending") return r.status === "pending_review";
    if (filter === "verified") return r.status === "verified";
    return true;
  });

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        pendingApprovalsCount={restaurants.filter((r) => r.status === "pending_review").length}
      />
      <AdminHeader
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
        <main className="relative flex-1 bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-outline-variant/40">
              <div>
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                  Merchant Registry
                </span>
                <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                  Manage Restaurants &amp; Outlets
                </h1>
                <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
                  Verify trade licenses, monitor dining outlets, and manage onboarding compliance.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant text-xs">
                {["all", "verified", "pending"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilter(t)}
                    className={`px-3 py-1.5 rounded-md capitalize font-semibold transition-all ${
                      filter === t
                        ? "bg-primary-container text-on-primary font-bold shadow-2xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {t === "all" ? "All Restaurants" : t === "pending" ? "Pending Approval" : "Verified"}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low font-label-sm text-[11px] uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/50">
                      <th className="py-3 px-5">Restaurant Name</th>
                      <th className="py-3 px-5">Cuisine &amp; Area</th>
                      <th className="py-3 px-5">License Owner</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 text-xs">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-primary text-lg">storefront</span>
                            <div>
                              <span className="font-bold text-on-surface block">{r.name}</span>
                              <span className="text-[10px] text-on-surface-variant font-mono">{r.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">{r.cuisine}</span>
                            <span className="text-[11px] text-on-surface-variant">{r.area}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">{r.owner}</span>
                            <span className="text-[11px] text-on-surface-variant">{r.phone}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          {r.status === "verified" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                              <span className="material-symbols-outlined text-xs">verified</span> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-[11px] font-bold">
                              <span className="material-symbols-outlined text-xs">hourglass_empty</span> Pending Approval
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          {r.status === "pending_review" ? (
                            <button
                              type="button"
                              onClick={() => handleApprove(r.id, r.name)}
                              className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                            >
                              Approve &amp; Verify
                            </button>
                          ) : (
                            <Link
                              href="/dashboard/vendor"
                              className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors"
                            >
                              View Console
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-lg border border-outline-variant/30 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
