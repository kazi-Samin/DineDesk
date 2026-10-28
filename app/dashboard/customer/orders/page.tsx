"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ProfileToast from "@/components/customer/profile/ProfileToast";
import DashboardLoader from "@/components/ui/DashboardLoader";

import { OrderConfirmation } from "@/types/order";
import { CustomerProfileData } from "@/types/customerProfile";
import { useCart } from "@/context/CartContext";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";

type OrderTabFilter = "all" | "active" | "delivered" | "cancelled";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

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

const EMPTY_PROFILE: CustomerProfileData = {
  fullName: "Diner",
  email: "",
  phone: "",
  avatarUrl: "",
  roleBadge: "Verified Foodie",
  memberSince: "Member since 2026",
  language: "en",
  dietaryPreferences: [],
  isEmailVerified: false,
  isPhoneVerified: false,
  passwordLastChangedDays: 0,
  twoFactorPhone: "",
  stats: {
    totalOrders: 0,
    activeBookings: 0,
    savedSpots: 0,
    loyaltyPoints: 0,
  },
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const { user, token: authContextToken } = useAuth();
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle(
    "dinedesk_customer_sidebar"
  );

  const [profile, setProfile] = useState<CustomerProfileData>(EMPTY_PROFILE);
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [savedSpotsCount, setSavedSpotsCount] = useState(0);
  const [validOrdersCount, setValidOrdersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const [activeTab, setActiveTab] = useState<OrderTabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [toast, setToast] = useState<{
    message: string | null;
    type: "success" | "error" | "info";
  }>({ message: null, type: "success" });

  const realUserName = user?.name || profile.fullName || "Diner";
  const realUserEmail = user?.email || profile.email || "";

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) =>
        prev.message === message ? { ...prev, message: null } : prev
      );
    }, 3000);
  };

  const loadDatabaseOrders = useCallback(async () => {
    try {
      const token = authContextToken || getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [profileRes, ordersRes, resApi, favoritesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/users/profile`, {
          method: "GET",
          headers,
          credentials: "include",
        }).catch(() => null),

        fetch(`${API_BASE_URL}/api/v1/orders/my`, {
          method: "GET",
          headers,
          credentials: "include",
        }).catch(() => null),

        fetch(`${API_BASE_URL}/api/v1/reservations`, {
          method: "GET",
          headers,
          credentials: "include",
        }).catch(() => null),

        fetch(`${API_BASE_URL}/api/v1/favorites`, {
          method: "GET",
          headers,
          credentials: "include",
        }).catch(() => null),
      ]);

      // 1. Process Profile & Loyalty Points
      let currentFullName = user?.name || "Diner";
      let currentEmail = user?.email || "";
      let currentPhone = user?.phone || "";
      let currentAvatar =
        user?.avatarUrl || (user as any)?.image || (user as any)?.avatar || "";
      let dbLoyaltyPoints = 0;

      if (profileRes && profileRes.ok) {
        const data = await profileRes.json();
        const userData = data.user || data.data || data;
        if (userData) {
          currentFullName =
            userData.fullName || userData.name || currentFullName;
          currentEmail = userData.email || currentEmail;
          currentPhone = userData.phone || currentPhone;
          currentAvatar =
            userData.avatarUrl || userData.image || currentAvatar;
          if (typeof userData.loyaltyPoints === "number") {
            dbLoyaltyPoints = userData.loyaltyPoints;
          }
        }
      }

      // 2. Process Live Reservations
      let liveReservations: any[] = [];
      if (resApi && resApi.ok) {
        const apiData = await resApi.json();
        liveReservations =
          apiData.reservations || apiData.data || apiData || [];
      }

      const activeBookings = liveReservations.filter((r: any) => {
        const st = String(r.status || "").toLowerCase();
        return st === "confirmed" || st === "upcoming" || st === "pending";
      }).length;

      // 3. Process Live Database Orders
      let dbOrders: OrderConfirmation[] = [];
      if (ordersRes && ordersRes.ok) {
        const apiData = await ordersRes.json();
        const list = apiData.data || apiData.orders || [];
        dbOrders = list.map((item: any) => ({
          orderId: String(item.id),
          restaurantName: item.restaurant?.name || "Partner Restaurant",
          items: item.items || [],
          total: Number(item.total || 0),
          status: String(
            item.status || "pending"
          ).toLowerCase() as OrderConfirmation["status"],
          fulfillmentMode: (item.orderType || "delivery").toLowerCase(),
          timeline: {
            placedAt: item.createdAt
              ? new Date(item.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
              : "Recently",
          },
        }));
      }

      const nonCancelledOrders = dbOrders.filter(
        (o) => !String(o.status || "").toLowerCase().includes("cancel")
      );
      const totalValid = nonCancelledOrders.length;

      const activeCount = nonCancelledOrders.filter((o) => {
        const st = String(o.status || "").toLowerCase();
        return st !== "delivered" && st !== "completed";
      }).length;

      const finalPoints =
        dbLoyaltyPoints > 0 ? dbLoyaltyPoints : totalValid * 20;

      // 4. Process Saved Spots directly from live /api/v1/favorites
      let liveSavedSpots = 0;
      if (favoritesRes && favoritesRes.ok) {
        const favsData = await favoritesRes.json();
        const favList =
          favsData.data || favsData.menus || favsData.favorites || [];
        liveSavedSpots = favList.length;
      }

      setOrders(dbOrders);
      setValidOrdersCount(totalValid);
      setActiveOrdersCount(activeCount);
      setLoyaltyPoints(finalPoints);
      setActiveBookingsCount(activeBookings);
      setSavedSpotsCount(liveSavedSpots);

      setProfile({
        ...EMPTY_PROFILE,
        fullName: currentFullName,
        email: currentEmail,
        phone: currentPhone,
        avatarUrl: currentAvatar,
        stats: {
          totalOrders: totalValid,
          activeBookings,
          savedSpots: liveSavedSpots,
          loyaltyPoints: finalPoints,
        },
      });
    } catch (err) {
      console.error("Error fetching live database orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [user, authContextToken]);

  useEffect(() => {
    loadDatabaseOrders();

    const handleSync = () => loadDatabaseOrders();

    window.addEventListener("profile-updated", handleSync);
    window.addEventListener("booking-updated", handleSync);
    window.addEventListener("order-updated", handleSync);
    window.addEventListener("dinedesk-points-updated", handleSync);

    return () => {
      window.removeEventListener("profile-updated", handleSync);
      window.removeEventListener("booking-updated", handleSync);
      window.removeEventListener("order-updated", handleSync);
      window.removeEventListener("dinedesk-points-updated", handleSync);
    };
  }, [loadDatabaseOrders]);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const token = getAuthToken();

      let res = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${API_BASE_URL}/api/v1/orders/${orderId}/cancel`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        }).catch(() => null);
      }

      if (res && res.ok) {
        showToast("Order cancelled successfully.", "info");

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("order-updated"));
          window.dispatchEvent(new Event("dinedesk-points-updated"));
          window.dispatchEvent(new Event("profile-updated"));
        }

        await loadDatabaseOrders();
      } else {
        const errData = res ? await res.json().catch(() => ({})) : {};
        showToast(errData.message || "Unable to cancel order.", "error");
      }
    } catch (err) {
      showToast("Network error cancelling order.", "error");
    }
  };

  const tabCounts = useMemo(() => {
    const all = orders.length;
    const active = orders.filter((o) => {
      const st = String(o.status || "").toLowerCase();
      return (
        st !== "delivered" &&
        st !== "completed" &&
        !st.includes("cancel")
      );
    }).length;
    const delivered = orders.filter((o) => {
      const st = String(o.status || "").toLowerCase();
      return st === "delivered" || st === "completed";
    }).length;
    const cancelled = orders.filter((o) =>
      String(o.status || "").toLowerCase().includes("cancel")
    ).length;
    return { all, active, delivered, cancelled };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const st = String(ord.status || "").toLowerCase();
      const isCancelled = st.includes("cancel");
      const isDelivered = st === "delivered" || st === "completed";

      if (activeTab === "active") {
        if (isDelivered || isCancelled) return false;
      } else if (activeTab === "delivered") {
        if (!isDelivered) return false;
      } else if (activeTab === "cancelled") {
        if (!isCancelled) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchRest = ord.restaurantName.toLowerCase().includes(q);
        const matchId = ord.orderId.toLowerCase().includes(q);
        const matchItems = ord.items.some((i) =>
          i.name.toLowerCase().includes(q)
        );
        if (!matchRest && !matchId && !matchItems) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

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

    showToast(
      `Redirecting to explore "${targetItem?.name || order.restaurantName}"...`
    );
    openDrawer();

    const searchDishName = targetItem?.name || "";
    router.push(`/explore?search=${encodeURIComponent(searchDishName)}`);
  };

  const cleanFirstName = profile.fullName.split(" ")[0] || "Diner";

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      <CustomerHeader
        userName={realUserName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex pt-16 flex-1">
        <CustomerSidebar
          userName={`${cleanFirstName}'s Account`}
          memberSince={profile.memberSince}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={activeOrdersCount}
          activeOrdersCount={validOrdersCount}
          upcomingReservationsCount={activeBookingsCount}
          loyaltyPoints={loyaltyPoints}
        />

        <main
          className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"
            }`}
        >
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low border-b border-outline-variant/30">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                  Order History
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Track real-time meal dispatches, view digital receipts, or
                  cancel active orders.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5 block">
                    {validOrdersCount}
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
                    {savedSpotsCount}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs">
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Points
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-semibold mt-0.5 block">
                    {loyaltyPoints.toLocaleString()} pts
                  </span>
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
                      {tab.label}{" "}
                      <span className="opacity-70">({tab.count})</span>
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
                <DashboardLoader />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-surface-container-lowest p-12 rounded-xl text-center border border-outline-variant shadow-xs flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2">
                  receipt_long
                </span>
                <h3 className="font-headline-sm text-base font-bold text-primary">
                  No Orders Found
                </h3>
                <p className="text-body-sm text-xs text-on-surface-variant mt-1 max-w-sm">
                  You do not have any orders matching this filter criteria.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredOrders.map((order) => {
                  const rawStatus = String(order.status || "").toLowerCase();
                  const isDelivered =
                    rawStatus === "delivered" || rawStatus === "completed";
                  const isCancelled = rawStatus.includes("cancel");
                  const isActive = !isDelivered && !isCancelled;

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
                              : "takeout_dining"}
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
                              className={`px-2 py-0.5 rounded-sm text-[11px] font-medium uppercase tracking-wider ${isCancelled
                                  ? "bg-red-100 text-red-700"
                                  : "bg-primary-fixed text-on-primary-fixed"
                                }`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                            <span className="font-semibold text-on-surface">
                              {order.items.reduce(
                                (sum, item) => sum + item.quantity,
                                0
                              )}{" "}
                              items:
                            </span>
                            {order.items.map((i, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleReorder(order, i)}
                                className="hover:underline hover:text-primary transition-colors cursor-pointer text-left inline-flex items-center gap-0.5 bg-surface-container-low px-1.5 py-0.5 rounded border border-outline-variant/30"
                                title={`Reorder & explore "${i.name}"`}
                              >
                                <span>
                                  {i.quantity}x {i.name}
                                </span>
                                <span className="material-symbols-outlined text-[11px] text-primary">
                                  open_in_new
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant/30">
                        <div className="text-left md:text-right">
                          <span className="text-[11px] text-on-surface-variant block">
                            Total Bill
                          </span>
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
                            <span className="material-symbols-outlined text-sm">
                              replay
                            </span>
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

      <ProfileToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: "success" })}
      />
    </div>
  );
}