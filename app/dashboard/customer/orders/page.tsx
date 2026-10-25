"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ProfileToast from "@/components/customer/profile/ProfileToast";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { OrderConfirmation } from "@/types/order";
import { CustomerProfileData } from "@/types/customerProfile";
import { fetchCustomerOrders } from "@/services/customerDataService";
import { useCart } from "@/context/CartContext";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";

type OrderTabFilter = "all" | "active" | "delivered" | "cancelled";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("dinedesk_auth_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("dinedesk_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const { user } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");

  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [savedSpotsCount, setSavedSpotsCount] = useState(0);
  const [validOrdersCount, setValidOrdersCount] = useState(0);

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

  const loadDatabaseOrders = async () => {
    setLoading(true);
    let loadedProfile = { ...INITIAL_CUSTOMER_PROFILE };

    if (user) {
      loadedProfile.fullName = user.name || loadedProfile.fullName;
      loadedProfile.email = user.email || loadedProfile.email;
      if (user.phone) loadedProfile.phone = user.phone;
      if (user.avatarUrl) {
        loadedProfile.avatarUrl = user.avatarUrl;
      } else {
        loadedProfile.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || "Diner")}`;
      }
    }

    const token = getAuthToken();

    try {
      const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include",
      }).catch(() => null);

      if (profileRes && profileRes.ok) {
        const data = await profileRes.json();
        const userData = data.user || data;
        if (userData && (!user || userData.email === user.email)) {
          loadedProfile = {
            ...loadedProfile,
            ...userData,
            fullName: userData.fullName || userData.name || loadedProfile.fullName,
            avatarUrl: userData.avatarUrl || loadedProfile.avatarUrl,
          };
        }
      }

      // 1. Fetch live reservations with Bearer token header
      let liveReservations: any[] = [];
      const resApi = await fetch(`${API_BASE_URL}/api/v1/reservations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include",
      }).catch(() => null);

      if (resApi && resApi.ok) {
        const apiData = await resApi.json();
        liveReservations = apiData.reservations || apiData.data || apiData || [];
      }

      // 2. Fetch live database orders from backend API
      const ordersRes = await fetch(`${API_BASE_URL}/api/v1/orders/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include",
      }).catch(() => null);

      let dbOrders: OrderConfirmation[] = [];
      if (ordersRes && ordersRes.ok) {
        const apiData = await ordersRes.json();
        const list = apiData.data || apiData.orders || [];
        dbOrders = list.map((item: any) => ({
          orderId: item.id,
          restaurantName: item.restaurant?.name || "Partner Restaurant",
          items: item.items || [],
          total: Number(item.total || 0),
          status: (item.status || "pending").toLowerCase(),
          fulfillmentMode: (item.orderType || "delivery").toLowerCase(),
          timeline: {
            placedAt: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"
          },
        }));
      }

      const realOrders = dbOrders.length > 0 ? dbOrders : await fetchCustomerOrders(user?.id);

      const userSpecificPayments = user?.id
        ? JSON.parse(localStorage.getItem(`dinedesk_stripe_payments_${user.id}`) || "[]")
        : [];
      const userSpecificFavorites = user?.id
        ? JSON.parse(localStorage.getItem(`dinedesk_saved_restaurants_${user.id}`) || localStorage.getItem(`dinedesk_saved_spots_${user.id}`) || "[]")
        : [];

      // Valid orders: exclude cancelled orders so metrics reflect active/completed orders
      const nonCancelledOrders = realOrders.filter(
        (o) => (o.status || "").toLowerCase() !== "cancelled"
      );
      const totalValidCount = nonCancelledOrders.length + userSpecificPayments.length;
      const calculatedPoints = totalValidCount * 20;

      const activeBookings = liveReservations.filter((r: any) => {
        const st = (r.status || "").toLowerCase();
        return st === "confirmed" || st === "upcoming" || st === "pending";
      }).length;

      setOrders(realOrders);
      setValidOrdersCount(totalValidCount);
      setLoyaltyPoints(calculatedPoints);
      setActiveBookingsCount(activeBookings);
      setSavedSpotsCount(userSpecificFavorites.length);

      setProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalOrders: totalValidCount,
          activeBookings: activeBookings,
          savedSpots: userSpecificFavorites.length,
          loyaltyPoints: calculatedPoints,
        }
      }));
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseOrders();

    const handleStorage = () => {
      loadDatabaseOrders();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("profile-updated", handleStorage);
    window.addEventListener("booking-updated", handleStorage);
    window.addEventListener("order-updated", handleStorage);
    window.addEventListener("dinedesk-points-updated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("profile-updated", handleStorage);
      window.removeEventListener("booking-updated", handleStorage);
      window.removeEventListener("order-updated", handleStorage);
      window.removeEventListener("dinedesk-points-updated", handleStorage);
    };
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include",
      });

      if (res.ok) {
        showToast("Order cancelled successfully.", "info");

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("order-updated"));
          window.dispatchEvent(new Event("dinedesk-points-updated"));
          window.dispatchEvent(new Event("storage"));
        }
        await loadDatabaseOrders();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || "Failed to cancel order.", "error");
      }
    } catch (err) {
      showToast("Network error cancelling order.", "error");
    }
  };

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
      if (activeTab === "active") {
        if (ord.status === "delivered" || ord.status === "completed" || ord.status === "cancelled") {
          return false;
        }
      } else if (activeTab === "delivered") {
        if (ord.status !== "delivered" && ord.status !== "completed") return false;
      } else if (activeTab === "cancelled") {
        if (ord.status !== "cancelled") return false;
      }

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

  // Adds item to cart and redirects to explore page filtered to that specific menu dish
  const handleReorder = (order: OrderConfirmation, specificItem?: any) => {
    const targetItem = specificItem || order.items[0];

    if (specificItem) {
      addItem({
        id: specificItem.menuItemId || specificItem.id,
        name: specificItem.name,
        price: Number(specificItem.price),
        quantity: specificItem.quantity || 1,
        image: specificItem.image || "/images/kacchi-biryani.png",
      });
    } else {
      order.items.forEach((item: any) => {
        addItem({
          id: item.menuItemId || item.id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity || 1,
          image: item.image || "/images/kacchi-biryani.png",
        });
      });
    }

    showToast(`Redirecting to explore "${targetItem?.name || order.restaurantName}"...`);
    openDrawer();

    const searchDishName = targetItem?.name || "";
    router.push(`/explore?search=${encodeURIComponent(searchDishName)}`);
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
          activeOrderCount={validOrdersCount}
          activeOrdersCount={validOrdersCount}
          upcomingReservationsCount={activeBookingsCount}
          loyaltyPoints={loyaltyPoints}
        />

        <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low border-b border-outline-variant/30">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                  Order History
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Track real-time meal dispatches, view digital receipts, or cancel active orders.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">Total Orders</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5 block">{validOrdersCount}</span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">Active</span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-semibold mt-0.5 block">{tabCounts.active}</span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">Saved Spots</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5 block">{savedSpotsCount}</span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">Points</span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-semibold mt-0.5 block">{loyaltyPoints.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          </section>

          <div className="w-full px-space-xl py-space-xl max-w-6xl mx-auto flex-1 flex flex-col gap-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
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
                      className={`px-3 py-1.5 rounded-md font-label-md text-xs transition-all cursor-pointer ${isActive
                        ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                      {tab.label} <span className="opacity-70">({tab.count})</span>
                    </button>
                  );
                })}
              </div>

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
                </div>
                <Link
                  href="/explore"
                  className="px-3.5 py-1.5 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold transition-colors shrink-0 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>New Order</span>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center">
                <span className="material-symbols-outlined text-3xl animate-spin text-primary">
                  progress_activity
                </span>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-surface-container-lowest p-12 rounded-xl text-center border border-outline-variant shadow-xs flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">receipt_long</span>
                <h3 className="font-headline-sm text-base font-bold text-primary">No Orders Found</h3>
                <p className="text-body-sm text-xs text-on-surface-variant mt-1 max-w-sm">
                  You do not have any orders matching this filter criteria.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === "delivered" || order.status === "completed";
                  const isCancelled = order.status === "cancelled";
                  const isActive = !isDelivered && !isCancelled;

                  return (
                    <article
                      key={order.orderId}
                      className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-space-md hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0 text-primary">
                          <span className="material-symbols-outlined text-xl">
                            {order.fulfillmentMode === "delivery" ? "two_wheeler" : "takeout_dining"}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-headline-sm text-base text-primary font-bold">
                              {order.restaurantName}
                            </h3>
                            <span className="font-mono text-xs text-on-surface-variant">#{order.orderId}</span>
                            <span className={`px-2 py-0.5 rounded-sm text-[11px] font-medium uppercase tracking-wider ${isCancelled
                              ? "bg-red-100 text-red-700"
                              : "bg-primary-fixed text-on-primary-fixed"
                              }`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Individual clickable item line to reorder specific menu item directly */}
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                            <span className="font-semibold text-on-surface">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items:
                            </span>
                            {order.items.map((i, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleReorder(order, i)}
                                className="hover:underline hover:text-primary transition-colors cursor-pointer text-left inline-flex items-center gap-0.5 bg-surface-container-low px-1.5 py-0.5 rounded border border-outline-variant/30"
                                title={`Reorder & explore "${i.name}"`}
                              >
                                <span>{i.quantity}x {i.name}</span>
                                <span className="material-symbols-outlined text-[11px] text-primary">open_in_new</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                        <div className="text-left md:text-right">
                          <span className="text-[11px] text-on-surface-variant block">Total Bill</span>
                          <span className="font-headline-sm text-base font-bold text-primary">
                            ${order.total.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isActive && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order.orderId)}
                              className="px-3 py-1.5 bg-error-container hover:bg-error text-on-error-container hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-xs font-medium transition-colors border border-outline-variant/60 flex items-center gap-1 cursor-pointer"
                            title={`Reorder and explore items from ${order.restaurantName}`}
                          >
                            <span className="material-symbols-outlined text-sm">replay</span>
                            <span>Reorder</span>
                          </button>
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

      <ProfileToast message={toast.message} type={toast.type} onClose={() => setToast({ message: null, type: "success" })} />
    </div>
  );
}