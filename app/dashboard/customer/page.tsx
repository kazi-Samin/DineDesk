"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import DashboardLoader from "@/components/ui/DashboardLoader";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { fetchCustomerOrders } from "@/services/customerDataService";
import { CustomerProfileData } from "@/types/customerProfile";
import { CustomerReservation } from "@/types/customerReservation";
import { FavoriteRestaurant } from "@/types/customerFavorites";
import { OrderConfirmation } from "@/types/order";
import { useReservation } from "@/context/ReservationContext";
import { useCart } from "@/context/CartContext";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

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

export default function CustomerDashboardOverviewPage() {
  const { openReservationModal } = useReservation();
  const { addItem, openDrawer } = useCart();
  const { user } = useAuth();

  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");
  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const loadDynamicOverviewData = async () => {
    try {
      let loadedProfile: CustomerProfileData = { ...INITIAL_CUSTOMER_PROFILE };

      // 1. Authenticated user details
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

      // 2. Load from localStorage if available
      if (typeof window !== "undefined") {
        const storedProfile = localStorage.getItem("dinedesk_customer_profile");
        if (storedProfile) {
          try {
            loadedProfile = { ...loadedProfile, ...JSON.parse(storedProfile) };
          } catch (e) {
            // ignore
          }
        }
      }

      const token = getAuthToken();

      // 3. Fetch live user profile from backend API
      const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

      // 4. Fetch live reservations with Authorization token
      let liveReservations: CustomerReservation[] = [];
      const resApi = await fetch(`${API_BASE_URL}/api/v1/reservations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      }).catch(() => null);

      if (resApi && resApi.ok) {
        const apiData = await resApi.json();
        const list = apiData.reservations || apiData.data || apiData || [];
        liveReservations = list.map((item: any) => {
          const rawStatus = (item.status || "confirmed").toLowerCase();
          return {
            id: item.id,
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
            restaurantImage: item.restaurantImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
            neighborhood: item.neighborhood || "Downtown",
            fullAddress: item.fullAddress || "Global City",
            cuisine: item.cuisine || "Fine Dining",
            date: item.date,
            displayDate: item.displayDate || item.date,
            time: item.time,
            mealPeriod: item.mealPeriod || "Dinner",
            partySize: item.partySize,
            seatingArea: item.seatingArea,
            tableNumber: item.tableNumber || "1",
            status: rawStatus,
            statusDisplay: item.statusDisplay || (rawStatus === "confirmed" ? "Confirmed" : rawStatus === "cancelled" ? "Cancelled" : "Pending"),
            specialNotes: item.specialNotes || "",
            isFeaturedUpcoming: item.isFeaturedUpcoming ?? (rawStatus === "confirmed"),
            createdAt: item.createdAt,
          };
        });
      }

      // 5. Fetch live database orders directly from backend API
      const ordersRes = await fetch(`${API_BASE_URL}/api/v1/orders/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

      // 6. Compute user-scoped favorites
      let userFavorites: FavoriteRestaurant[] = [];
      if (typeof window !== "undefined" && user?.id) {
        const storedFavs =
          localStorage.getItem(`dinedesk_saved_restaurants_${user.id}`) ||
          localStorage.getItem(`dinedesk_saved_spots_${user.id}`);
        if (storedFavs) {
          try {
            userFavorites = JSON.parse(storedFavs);
          } catch (e) {
            userFavorites = [];
          }
        }
      }

      // 7. Calculate valid (non-cancelled) orders
      const userSpecificPayments = user?.id
        ? JSON.parse(localStorage.getItem(`dinedesk_stripe_payments_${user.id}`) || "[]")
        : [];

      const nonCancelledOrders = realOrders.filter(
        (o) => (o.status || "").toLowerCase() !== "cancelled"
      );
      const totalValidOrders = nonCancelledOrders.length + userSpecificPayments.length;
      const calculatedPoints = totalValidOrders * 20;

      const activeOrders = realOrders.filter((o) => {
        const st = (o.status || "").toLowerCase();
        return st !== "delivered" && st !== "completed" && st !== "cancelled";
      }).length;

      const activeBookingsCount = liveReservations.filter((r) => {
        const st = (r.status || "").toLowerCase();
        return st === "confirmed" || st === "upcoming" || st === "pending";
      }).length;

      setActiveOrdersCount(activeOrders);

      loadedProfile.stats = {
        ...loadedProfile.stats,
        totalOrders: totalValidOrders,
        activeBookings: activeBookingsCount,
        savedSpots: userFavorites.length,
        loyaltyPoints: calculatedPoints,
      };

      setProfile(loadedProfile);
      setReservations(liveReservations);
      setFavorites(userFavorites);
      setOrders(realOrders);
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadDynamicOverviewData();

    const handleSync = () => loadDynamicOverviewData();
    window.addEventListener("storage", handleSync);
    window.addEventListener("profile-updated", handleSync);
    window.addEventListener("booking-updated", handleSync);
    window.addEventListener("order-updated", handleSync);
    window.addEventListener("dinedesk-points-updated", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("profile-updated", handleSync);
      window.removeEventListener("booking-updated", handleSync);
      window.removeEventListener("order-updated", handleSync);
      window.removeEventListener("dinedesk-points-updated", handleSync);
    };
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col antialiased">
        <DashboardLoader />
      </div>
    );
  }

  const upcomingReservation = reservations.find((res) => {
    const st = (res.status || "").toLowerCase();
    return st === "confirmed" || st === "pending" || st === "upcoming";
  });

  const activeOrder = orders.find((ord) => {
    const st = (ord.status || "").toLowerCase();
    return st !== "delivered" && st !== "completed" && st !== "cancelled";
  });

  const recentOrders = orders.slice(0, 3);
  const topFavorites = favorites.slice(0, 3);

  return (
    <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex flex-col font-body-md antialiased selection:bg-[#1b3b2b] selection:text-white">
      {/* Top Fixed Customer Navigation Header */}
      <CustomerHeader
        userName={profile.fullName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Main Layout Container */}
      <div className="flex pt-16 flex-1">
        {/* Fixed Left Navigation Sidebar */}
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince={profile.memberSince}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
          activeOrderCount={activeOrdersCount}
          activeOrdersCount={profile.stats.totalOrders}
          upcomingReservationsCount={profile.stats.activeBookings}
          loyaltyPoints={profile.stats.loyaltyPoints}
        />

        {/* Main Content Area */}
        <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>

          {/* Section 1: Luxury Patron Welcome Banner & Live Stats */}
          <section className="w-full px-6 sm:px-10 py-8 bg-gradient-to-r from-white via-[#f8f9f6] to-white border-b border-[#1b3b2b]/10 shadow-xs">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1b3b2b] tracking-tight">
                    Welcome back, {profile.fullName.split(" ")[0]}
                  </h1>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#1b3b2b]/10 text-[#1b3b2b] border border-[#1b3b2b]/15">
                    {profile.roleBadge}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#1b3b2b]/70 flex items-center gap-2">
                  <span>{profile.email}</span>
                  {profile.phone && <span>• {profile.phone}</span>}
                </p>
              </div>

              {/* 4 Summary Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href="/dashboard/customer/orders"
                  className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm hover:border-[#1b3b2b] transition-all group"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#1b3b2b]/60 block group-hover:text-[#1b3b2b]">
                    Total Orders
                  </span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">
                    {profile.stats.totalOrders}
                  </span>
                </Link>

                <Link
                  href="/dashboard/customer/reservations"
                  className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm hover:border-[#C05621] transition-all group"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#1b3b2b]/60 block group-hover:text-[#C05621]">
                    Bookings
                  </span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                    {profile.stats.activeBookings}
                  </span>
                </Link>

                <Link
                  href="/dashboard/customer/favorites"
                  className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm hover:border-[#1b3b2b] transition-all group"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#1b3b2b]/60 block group-hover:text-[#1b3b2b]">
                    Saved Spots
                  </span>
                  <span className="font-heading font-black text-xl text-[#1b3b2b] mt-0.5 block">
                    {profile.stats.savedSpots}
                  </span>
                </Link>

                <Link
                  href="/dashboard/customer/loyalty"
                  className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#1b3b2b]/15 shadow-sm hover:border-[#C05621] transition-all group"
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#1b3b2b]/60 block group-hover:text-[#C05621]">
                    Loyalty Pts
                  </span>
                  <span className="font-heading font-black text-xl text-[#C05621] mt-0.5 block">
                    {profile.stats.loyaltyPoints.toLocaleString()}
                  </span>
                </Link>
              </div>
            </motion.div>
          </section>

          {/* Section 2: Core Dashboard Content */}
          <div className="w-full px-6 sm:px-10 py-10 max-w-7xl mx-auto flex-1 flex flex-col gap-10">

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/explore"
                className="p-5 bg-white/80 backdrop-blur-lg rounded-2xl border border-[#1b3b2b]/15 shadow-sm hover:shadow-md hover:border-[#1b3b2b] transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1b3b2b]/10 text-[#1b3b2b] flex items-center justify-center shrink-0 group-hover:bg-[#1b3b2b] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1b3b2b]">Order Food</h3>
                  <p className="text-[11px] text-[#1b3b2b]/70 font-medium">Browse local spots</p>
                </div>
              </Link>

              <Link
                href="/reservations"
                type="button"
                onClick={() =>
                  openReservationModal({
                    id: "the-maple-and-vine",
                    name: "The Culinary House",
                    neighborhood: "Downtown",
                  })
                }
                className="p-5 bg-white/80 backdrop-blur-lg rounded-2xl border border-[#1b3b2b]/15 shadow-sm hover:shadow-md hover:border-[#1b3b2b] transition-all flex items-center gap-4 group text-left cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1b3b2b]/10 text-[#1b3b2b] flex items-center justify-center shrink-0 group-hover:bg-[#1b3b2b] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">table_restaurant</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1b3b2b]">Reserve Table</h3>
                  <p className="text-[11px] text-[#1b3b2b]/70 font-medium">Book ahead</p>
                </div>
              </Link>

              <Link
                href="/dashboard/customer/addresses"
                className="p-5 bg-white/80 backdrop-blur-lg rounded-2xl border border-[#1b3b2b]/15 shadow-sm hover:shadow-md hover:border-[#1b3b2b] transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1b3b2b]/10 text-[#1b3b2b] flex items-center justify-center shrink-0 group-hover:bg-[#1b3b2b] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">location_on</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1b3b2b]">Saved Addresses</h3>
                  <p className="text-[11px] text-[#1b3b2b]/70 font-medium">Delivery locations</p>
                </div>
              </Link>

              <Link
                href="/dashboard/customer/favorites"
                className="p-5 bg-white/80 backdrop-blur-lg rounded-2xl border border-[#1b3b2b]/15 shadow-sm hover:shadow-md hover:border-[#C05621] transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C05621]/10 text-[#C05621] flex items-center justify-center shrink-0 group-hover:bg-[#C05621] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-2xl">favorite</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1b3b2b]">Saved Favorites</h3>
                  <p className="text-[11px] text-[#1b3b2b]/70 font-medium">Kitchens &amp; dishes</p>
                </div>
              </Link>
            </div>

            {/* Active Dining Highlights: Order & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Active Order Tracker */}
              {activeOrder ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#1b3b2b]/15 shadow-xl p-8 flex flex-col justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#1b3b2b]/5 rounded-bl-full pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#1b3b2b]/10">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C05621] animate-ping" />
                        <span className="text-[11px] uppercase tracking-widest text-[#C05621] font-extrabold">
                          Active Order Status
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#1b3b2b]/70 font-bold bg-[#1b3b2b]/5 px-2.5 py-1 rounded-lg">
                        #{activeOrder.orderId}
                      </span>
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-heading font-extrabold text-xl text-[#1b3b2b]">
                          {activeOrder.restaurantName}
                        </h2>
                        <p className="text-xs text-[#1b3b2b]/70 font-medium mt-1">
                          {activeOrder.items.length} {activeOrder.items.length === 1 ? "item" : "items"}:{" "}
                          {activeOrder.items.map((i) => i.name).join(", ")}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#1b3b2b] text-white text-xs font-bold shrink-0 shadow-sm">
                        {activeOrder.status === "preparing" ? "Kitchen Preparing" : "Order Placed"}
                      </span>
                    </div>

                    <div className="mt-5 p-4 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/10 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2 text-[#1b3b2b]/70">
                        <span className="material-symbols-outlined text-base text-[#1b3b2b]">
                          schedule
                        </span>
                        <span>Estimated Arrival: <strong className="text-[#1b3b2b]">25–35 mins</strong></span>
                      </div>
                      <span className="font-black text-primary text-base">
                        ${activeOrder.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-medium text-[#1b3b2b]/60">
                      Delivery to {profile.fullName.split(" ")[0]}&apos;s Default Address
                    </span>
                    <Link
                      href={`/order-confirmation/${activeOrder.orderId}`}
                      className="px-5 py-2.5 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-md cursor-pointer"
                    >
                      <span>Live Tracker</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#1b3b2b]/15 shadow-xl p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[260px]">
                  <div className="w-16 h-16 rounded-2xl bg-[#1b3b2b]/10 flex items-center justify-center text-[#1b3b2b]">
                    <span className="material-symbols-outlined text-3xl">receipt_long</span>
                  </div>
                  <h2 className="font-heading font-extrabold text-lg text-[#1b3b2b]">No Active Orders</h2>
                  <p className="text-xs text-[#1b3b2b]/70 max-w-xs font-medium">
                    Satisfy your cravings from our finest partner kitchens with secure online checkout.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-2 px-5 py-2.5 bg-[#1b3b2b] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1b3b2b]/90 transition-all shadow-md"
                  >
                    Explore Restaurants
                  </Link>
                </div>
              )}

              {/* Upcoming Reservation Card */}
              {upcomingReservation ? (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#1b3b2b]/15 shadow-xl p-8 flex flex-col justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C05621]/5 rounded-bl-full pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[#1b3b2b]/10">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1b3b2b] animate-ping" />
                        <span className="text-[11px] uppercase tracking-widest text-[#1b3b2b] font-extrabold">
                          Confirmed Table Hold
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#1b3b2b]/70 font-bold bg-[#1b3b2b]/5 px-2.5 py-1 rounded-lg">
                        REF #{upcomingReservation.id}
                      </span>
                    </div>

                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-heading font-extrabold text-xl text-[#1b3b2b]">
                          {upcomingReservation.restaurantName}
                        </h2>
                        <p className="text-xs text-[#1b3b2b]/70 font-medium mt-1">
                          {upcomingReservation.neighborhood} • {upcomingReservation.seatingArea}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#C05621] text-white text-xs font-bold shrink-0 shadow-sm">
                        Table {upcomingReservation.tableNumber || "Reserved"}
                      </span>
                    </div>

                    <div className="mt-5 p-4 bg-[#f8f9f6] rounded-2xl border border-[#1b3b2b]/10 grid grid-cols-3 gap-3 text-xs font-bold">
                      <div>
                        <span className="text-[#1b3b2b]/50 block text-[10px] uppercase">Date</span>
                        <span className="text-[#1b3b2b] text-sm">{upcomingReservation.displayDate}</span>
                      </div>
                      <div>
                        <span className="text-[#1b3b2b]/50 block text-[10px] uppercase">Time</span>
                        <span className="text-[#C05621] text-sm">{upcomingReservation.time}</span>
                      </div>
                      <div>
                        <span className="text-[#1b3b2b]/50 block text-[10px] uppercase">Party</span>
                        <span className="text-[#1b3b2b] text-sm">{upcomingReservation.partySize} Diners</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-medium text-[#1b3b2b]/60">
                      Valet Parking Available
                    </span>
                    <Link
                      href="/dashboard/customer/reservations"
                      className="px-5 py-2.5 bg-white border border-[#1b3b2b]/20 hover:bg-[#1b3b2b]/5 text-[#1b3b2b] rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Digital Pass</span>
                      <span className="material-symbols-outlined text-sm">confirmation_number</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#1b3b2b]/15 shadow-xl p-8 flex flex-col items-center justify-center text-center gap-3 min-h-[260px]">
                  <div className="w-16 h-16 rounded-2xl bg-[#C05621]/10 flex items-center justify-center text-[#C05621]">
                    <span className="material-symbols-outlined text-3xl">table_restaurant</span>
                  </div>
                  <h2 className="font-heading font-extrabold text-lg text-[#1b3b2b]">No Upcoming Reservations</h2>
                  <p className="text-xs text-[#1b3b2b]/70 max-w-xs font-medium">
                    Reserve a curated dining table for lunch or dinner tonight with priority seating.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      openReservationModal({
                        id: "the-maple-and-vine",
                        name: "The Culinary House",
                        neighborhood: "Downtown",
                      })
                    }
                    className="mt-2 px-5 py-2.5 bg-[#1b3b2b] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1b3b2b]/90 transition-all shadow-md cursor-pointer"
                  >
                    Book a Table
                  </button>
                </div>
              )}
            </div>

            {/* Split Section: Recent Orders & Bookmarked Favorites */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column: Recent Orders List (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-extrabold text-lg text-[#1b3b2b]">
                    Recent Orders
                  </h2>
                  <Link
                    href="/dashboard/customer/orders"
                    className="text-xs text-[#C05621] hover:underline font-bold uppercase tracking-wider"
                  >
                    View All ({orders.length})
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((ord) => {
                      const isCancelled = (ord.status || "").toLowerCase() === "cancelled";

                      return (
                        <div
                          key={ord.orderId}
                          className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isCancelled
                              ? "bg-red-50/50 border-red-200 opacity-80"
                              : "bg-white/90 backdrop-blur-xl border-[#1b3b2b]/15 shadow-sm hover:border-[#1b3b2b]"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCancelled ? "bg-red-100 text-red-600" : "bg-[#1b3b2b]/10 text-[#1b3b2b]"
                                }`}
                            >
                              <span className="material-symbols-outlined text-xl">
                                {isCancelled ? "cancel" : "receipt"}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className={`font-heading font-bold text-sm ${isCancelled ? "text-red-950 line-through" : "text-[#1b3b2b]"}`}>
                                  {ord.restaurantName}
                                </h3>
                                <span className="px-2 py-0.5 rounded bg-[#f8f9f6] text-[#1b3b2b]/70 text-[10px] font-mono font-bold">
                                  #{ord.orderId}
                                </span>
                                {isCancelled ? (
                                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                                    Cancelled
                                  </span>
                                ) : null}
                              </div>

                              {isCancelled ? (
                                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">info</span>
                                  This item was cancelled / deleted from orders page
                                </p>
                              ) : (
                                <p className="text-xs text-[#1b3b2b]/70 font-medium mt-1 line-clamp-1">
                                  {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1b3b2b]/10">
                            <span className={`font-heading font-black text-base ${isCancelled ? "text-gray-400 line-through" : "text-[#1b3b2b]"}`}>
                              ${ord.total.toLocaleString()}
                            </span>
                            <Link
                              href={`/order-confirmation/${ord.orderId}`}
                              className="px-4 py-2 bg-[#f8f9f6] hover:bg-[#1b3b2b]/10 text-[#1b3b2b] rounded-xl text-xs font-bold transition-all border border-[#1b3b2b]/15"
                            >
                              Receipt
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white/90 backdrop-blur-xl p-10 rounded-2xl border border-[#1b3b2b]/15 shadow-sm flex flex-col items-center justify-center text-center gap-3">
                      <span className="material-symbols-outlined text-3xl text-[#1b3b2b]/40">
                        receipt_long
                      </span>
                      <h3 className="font-heading font-bold text-sm text-[#1b3b2b]">No Recent Orders</h3>
                      <p className="text-xs text-[#1b3b2b]/70 max-w-sm font-medium">
                        You haven&apos;t placed any orders yet. Discover our partner kitchens.
                      </p>
                      <Link
                        href="/explore"
                        className="mt-2 px-4 py-2 bg-[#1b3b2b] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#1b3b2b]/90 transition-all shadow-md"
                      >
                        Browse Restaurants
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Loyalty Summary & Saved Spots (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">

                {/* Loyalty Tier Card */}
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#1b3b2b]/15 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#C05621] text-2xl">
                        workspace_premium
                      </span>
                      <h2 className="font-heading font-extrabold text-base text-[#1b3b2b]">
                        {profile.stats.loyaltyPoints >= 2000
                          ? "Platinum VIP Patron"
                          : profile.stats.loyaltyPoints >= 1000
                            ? "Gold Foodie Patron"
                            : "Silver Foodie Patron"}
                      </h2>
                    </div>
                    <Link
                      href="/dashboard/customer/loyalty"
                      className="text-xs text-[#C05621] hover:underline font-bold uppercase tracking-wider"
                    >
                      Rewards
                    </Link>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                      <span className="text-[#1b3b2b]/70">Points Progress</span>
                      <span className="text-[#C05621]">{profile.stats.loyaltyPoints} / 2,000 pts</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#f8f9f6] rounded-full overflow-hidden border border-[#1b3b2b]/10">
                      <div
                        className="h-full bg-gradient-to-r from-[#1b3b2b] to-[#C05621] rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, (profile.stats.loyaltyPoints / 2000) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-[#1b3b2b]/70 mt-2 font-medium">
                      {profile.stats.loyaltyPoints >= 2000
                        ? "You have achieved Platinum VIP Priority Seating status!"
                        : `Earn ${Math.max(0, 2000 - profile.stats.loyaltyPoints)} more points to unlock Platinum VIP Priority Seating.`}
                    </p>
                  </div>
                </div>

                {/* Top Saved Spots */}
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#1b3b2b]/15 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading font-extrabold text-base text-[#1b3b2b]">
                      Top Saved Spots
                    </h2>
                    <Link
                      href="/dashboard/customer/favorites"
                      className="text-xs text-[#C05621] hover:underline font-bold uppercase tracking-wider"
                    >
                      See All ({favorites.length})
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3">
                    {topFavorites.length > 0 ? (
                      topFavorites.map((spot) => (
                        <div
                          key={spot.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#f8f9f6] border border-[#1b3b2b]/10 hover:border-[#1b3b2b] transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={spot.image}
                              alt={spot.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 bg-white shadow-xs"
                            />
                            <div className="min-w-0">
                              <h3 className="font-heading font-bold text-xs text-[#1b3b2b] truncate">
                                {spot.name}
                              </h3>
                              <span className="text-[11px] text-[#1b3b2b]/70 truncate block font-medium">
                                {spot.cuisine} • {spot.neighborhood}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openReservationModal({
                                id: spot.restaurantId,
                                name: spot.name,
                                neighborhood: spot.neighborhood,
                              })
                            }
                            className="px-3.5 py-1.5 text-xs font-bold bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl transition-all shrink-0 shadow-sm cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 px-4 bg-[#f8f9f6] rounded-2xl text-center flex flex-col items-center justify-center gap-2 border border-dashed border-[#1b3b2b]/20">
                        <span className="material-symbols-outlined text-2xl text-[#1b3b2b]/40">
                          bookmark_border
                        </span>
                        <p className="text-xs text-[#1b3b2b]/70 font-medium">
                          No saved spots yet.
                        </p>
                        <Link
                          href="/explore"
                          className="text-xs font-bold text-[#C05621] hover:underline mt-1 uppercase tracking-wider"
                        >
                          Explore Restaurants
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Shared Customer Footer */}
          <CustomerFooter />
        </main>
      </div>
    </div>
  );
}