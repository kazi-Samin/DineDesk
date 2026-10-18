"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ProfileToast from "@/components/customer/profile/ProfileToast";
import { getMockOrders } from "@/services/mockOrderService";
import { getCustomerProfile } from "@/services/mockCustomerProfileService";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { OrderConfirmation } from "@/types/order";
import { CustomerProfileData } from "@/types/customerProfile";
import { useCart } from "@/context/CartContext";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";

type OrderTabFilter = "all" | "active" | "delivered" | "cancelled";

export default function CustomerOrdersPage() {
  const { addItem, openDrawer } = useCart();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");
  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<OrderTabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState<{
    message: string | null;
    type: "success" | "error" | "info";
  }>({ message: null, type: "success" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { ...prev, message: null } : prev));
    }, 3000);
  };

  useEffect(() => {
    const p = getCustomerProfile();
    const o = getMockOrders();
    setProfile(p);
    setOrders(o);
    setLoading(false);
  }, []);

  const tabCounts = useMemo(() => {
    const all = orders.length;
    const active = orders.filter(
      (o) => o.status !== "delivered" && o.status !== "completed" && o.status !== "cancelled"
    ).length;
    const delivered = orders.filter(
      (o) => o.status === "delivered" || o.status === "completed"
    ).length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    return { all, active, delivered, cancelled };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Tab filter
      if (activeTab === "active") {
        if (ord.status === "delivered" || ord.status === "completed" || ord.status === "cancelled") {
          return false;
        }
      } else if (activeTab === "delivered") {
        if (ord.status !== "delivered" && ord.status !== "completed") return false;
      } else if (activeTab === "cancelled") {
        if (ord.status !== "cancelled") return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRest = ord.restaurantName.toLowerCase().includes(q);
        const matchId = ord.orderId.toLowerCase().includes(q);
        const matchItems = ord.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchRest && !matchId && !matchItems) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

  const handleReorder = (order: OrderConfirmation) => {
    order.items.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: item.variant,
        image: "/images/kacchi-biryani.png",
      });
    });
    showToast(`Added items from ${order.restaurantName} to your cart.`);
    openDrawer();
  };

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      <CustomerHeader
        userName={profile.fullName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex pt-16 flex-1">
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince={profile.memberSince}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={tabCounts.active}
          loyaltyPoints={profile.stats.loyaltyPoints}
        />

        <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
          {/* Section 1: Patron Welcome Banner & Stats */}
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low border-b border-outline-variant/30">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                    Order History
                  </h1>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Track real-time meal dispatches, view digital receipts, or reorder past favorites.
                </p>
              </div>

              {/* 4 Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5 block">
                    {profile.stats.totalOrders}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Active
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-semibold mt-0.5 block">
                    {tabCounts.active}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Saved Spots
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5 block">
                    {profile.stats.savedSpots}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Points
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-semibold mt-0.5 block">
                    {profile.stats.loyaltyPoints.toLocaleString()} pts
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Orders List & Filters */}
          <div className="w-full px-space-xl py-space-xl max-w-6xl mx-auto flex-1 flex flex-col gap-space-lg">
            {/* Filter Bar & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant">
                {[
                  { id: "all", label: "All Orders", count: tabCounts.all },
                  { id: "active", label: "In Progress", count: tabCounts.active },
                  { id: "delivered", label: "Completed", count: tabCounts.delivered },
                  { id: "cancelled", label: "Cancelled", count: tabCounts.cancelled },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as OrderTabFilter)}
                      className={`px-3 py-1.5 rounded-md font-label-md text-xs transition-all ${
                        isActive
                          ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {tab.label} <span className="opacity-70">({tab.count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Search & New Order CTA */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-60">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                    search
                  </span>
                  <input
                    className="w-full pl-8 pr-3 py-1.5 bg-surface-container-lowest text-xs rounded-md border border-outline-variant placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-container shadow-xs"
                    placeholder="Search restaurant or dish..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  )}
                </div>

                <Link
                  href="/explore"
                  className="px-3.5 py-1.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>New Order</span>
                </Link>
              </div>
            </div>

            {/* Orders Feed */}
            {loading ? (
              <div className="py-20 flex justify-center">
                <span className="material-symbols-outlined text-3xl animate-spin text-primary">
                  progress_activity
                </span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-surface-container-lowest p-12 rounded-xl text-center border border-outline-variant shadow-xs flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2">
                  receipt_long
                </span>
                <h3 className="font-headline-sm text-base font-bold text-primary">
                  {searchQuery ? "No matching orders found" : "No orders found"}
                </h3>
                <p className="text-body-sm text-xs text-on-surface-variant mt-1 max-w-sm">
                  {searchQuery
                    ? "Try searching for a different keyword or reset your filter."
                    : "You have not placed any orders matching this category."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("all");
                    setSearchQuery("");
                  }}
                  className="mt-4 px-4 py-2 bg-surface-container-low text-xs font-medium rounded-lg hover:bg-surface-container transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === "delivered" || order.status === "completed";
                  const isCancelled = order.status === "cancelled";
                  const isActive = !isDelivered && !isCancelled;

                  const statusBadgeClass = isDelivered
                    ? "bg-surface-container-high text-on-surface-variant"
                    : isCancelled
                    ? "bg-error-container text-on-error-container"
                    : "bg-primary-fixed text-on-primary-fixed font-semibold animate-pulse";

                  return (
                    <article
                      key={order.orderId}
                      className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-md hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0 text-primary">
                          <span className="material-symbols-outlined text-xl">
                            {order.fulfillmentMode === "delivery"
                              ? "two_wheeler"
                              : order.fulfillmentMode === "takeaway"
                              ? "takeout_dining"
                              : "table_restaurant"}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-headline-sm text-base text-primary font-bold">
                              {order.restaurantName}
                            </h3>
                            <span className="font-mono text-xs text-on-surface-variant">
                              #{order.orderId}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-sm text-[11px] font-medium uppercase tracking-wider ${statusBadgeClass}`}
                            >
                              {order.status.replace(/_/g, " ")}
                            </span>
                          </div>

                          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items:{" "}
                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-outline mt-1">
                            <span className="capitalize font-medium text-on-surface">
                              Mode: {order.fulfillmentMode}
                            </span>
                            <span>•</span>
                            <span>Placed: {order.timeline?.placedAt || "Recently"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                        <div className="text-left md:text-right">
                          <span className="text-[11px] text-on-surface-variant block">Total Bill</span>
                          <span className="font-headline-sm text-base font-bold text-primary">
                            ৳{order.total.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-xs font-medium transition-colors border border-outline-variant/60 flex items-center gap-1 cursor-pointer"
                            title="Reorder same items"
                          >
                            <span className="material-symbols-outlined text-sm">replay</span>
                            <span>Reorder</span>
                          </button>

                          <Link
                            href={`/order-confirmation/${order.orderId}`}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                              isActive
                                ? "bg-primary-container hover:bg-primary text-on-primary shadow-xs"
                                : "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40"
                            }`}
                          >
                            <span>{isActive ? "Track" : "Receipt"}</span>
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <CustomerFooter />
        </main>
      </div>

      <ProfileToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: "success" })}
      />
    </div>
  );
}
