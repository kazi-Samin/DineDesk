// app/dashboard/vendor/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface DashboardMetrics {
  todayRevenue: number;
  activePrepCount: number;
  inTransitCount?: number;
  fulfilledCount?: number;
  totalOrdersCount?: number;
  totalMenuItems: number;
  activeMenuItems: number;
  todayReservations: number;
  estimatedOccupancy: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
}

interface LiveOrder {
  id: string;
  orderType: "DELIVERY" | "PICKUP" | "DINE_IN";
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REJECTED";
  total: string | number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    phone?: string;
  };
  items: OrderItem[];
}

interface TableHold {
  id: string;
  restaurantName: string;
  partySize: number;
  date: string;
  displayDate?: string;
  time: string;
  mealPeriod?: string;
  seatingArea?: string;
  tableNumber?: string;
  status: string;
  statusDisplay?: string;
  specialNotes?: string;
  user?: {
    id: string;
    name: string;
    phone?: string;
  };
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://dine-desk-backend.vercel.app"
)
  .replace(/\/api\/v1\/?$/, "")
  .replace(/\/+$/, "") + "/api/v1";

const getAuthToken = () => {
  if (typeof window === "undefined") return "";

  const match = document.cookie.match(
    /(?:^|;\s*)(?:token|dinedesk_auth_token|better-auth\.session_token|auth_token|accessToken)=([^;]+)/
  );
  if (match && match[1]) return match[1].trim();

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("dinedesk_auth_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("dinedesk_token") ||
    localStorage.getItem("auth_token") ||
    ""
  ).trim();
};

const getRequestHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["x-session-token"] = token;
    headers["better-auth-session-token"] = token;
  }

  return headers;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function VendorExecutiveDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("Culinary Outlet");
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [reservations, setReservations] = useState<TableHold[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      const headers = getRequestHeaders();

      const [analyticsRes, ordersRes, holdsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/orders/vendor/analytics`, {
          credentials: "include",
          headers,
        }),
        fetch(`${API_BASE_URL}/orders/vendor/queue`, {
          credentials: "include",
          headers,
        }),
        fetch(`${API_BASE_URL}/reservations/vendor/holds`, {
          credentials: "include",
          headers,
        }),
      ]);

      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        const data = json.data || json;
        if (data?.metrics) {
          setMetrics(data.metrics);
        }
        if (data?.restaurantName) {
          setRestaurantName(data.restaurantName);
        }
      }

      if (ordersRes.ok) {
        const json = await ordersRes.json();
        setOrders(json.data || json.orders || []);
      }

      if (holdsRes.ok) {
        const json = await holdsRes.json();
        setReservations(json.data || json.reservations || json.holds || []);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Dashboard synchronization error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    try {
      setActionLoadingId(orderId);
      const headers = getRequestHeaders();

      const res = await fetch(`${API_BASE_URL}/orders/vendor/${orderId}/status`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Only display active tickets that require kitchen dispatch in the overview queue
  const activeOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status !== "CANCELLED" && o.status !== "REJECTED"
    );
  }, [orders]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full min-h-screen bg-[#FBFBFA] text-[#1b3b2b] pb-16 font-sans selection:bg-[#1b3b2b] selection:text-white"
    >
      {/* 1. Header Banner & Quick Status Ribbon */}
      <section className="w-full bg-white/90 backdrop-blur-md border-b border-[#1b3b2b]/10 px-4 sm:px-6 lg:px-10 py-6 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#1b3b2b]">
                Executive Kitchen Operations Console
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-[11px] font-mono font-medium text-neutral-400">
                Synced at {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b3b2b] flex items-center gap-3">
              {loading ? (
                <span className="inline-block w-56 h-8 bg-neutral-200 animate-pulse rounded-lg" />
              ) : (
                restaurantName
              )}
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              Real-time culinary dispatch, live orders telemetry, and dining room performance metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setLoading(true);
                fetchDashboardData();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#1b3b2b]/5 text-[#1b3b2b] text-xs font-bold transition-all border border-[#1b3b2b]/15 shadow-2xs hover:border-[#1b3b2b]/30 cursor-pointer disabled:opacity-50"
            >
              <motion.span
                animate={loading ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                className="material-symbols-outlined text-base"
              >
                refresh
              </motion.span>
              <span>{loading ? "Syncing..." : "Sync Live Shift"}</span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* 2. Main Executive Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 space-y-9">

        {/* KPI Telemetry Stat Strip */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* Card 1: Today Revenue */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#1b3b2b]/10 border-l-[6px] border-l-[#1b3b2b] shadow-xs hover:shadow-md hover:border-[#1b3b2b]/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Today Revenue
              </span>
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 rounded-xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center group-hover:bg-[#1b3b2b] group-hover:text-white transition-colors duration-300"
              >
                <span className="material-symbols-outlined text-xl">payments</span>
              </motion.span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-[#1b3b2b] tracking-tight">
                {loading ? "..." : `$${Number(metrics?.todayRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-800">
                100% Reconciled
              </span>
              <span className="text-[11px] text-neutral-400">• Total sales today</span>
            </div>
          </motion.div>

          {/* Card 2: Active Orders */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#1b3b2b]/10 border-l-[6px] border-l-[#C05621] shadow-xs hover:shadow-md hover:border-[#C05621]/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Active Orders
              </span>
              <motion.span
                animate={{ y: [0, -3, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 rounded-xl bg-[#C05621]/10 text-[#C05621] flex items-center justify-center group-hover:bg-[#C05621] group-hover:text-white transition-colors duration-300"
              >
                <span className="material-symbols-outlined text-xl">skillet</span>
              </motion.span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-[#C05621] tracking-tight">
                {loading ? "..." : (metrics?.activePrepCount ?? activeOrders.length)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C05621] animate-pulse" />
              <span className="text-[11px] font-bold text-[#C05621]">
                {activeOrders.length} tickets in queue
              </span>
              <span className="text-[11px] text-neutral-400">• Real-time dispatch</span>
            </div>
          </motion.div>

          {/* Card 3: Table Occupancy */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#1b3b2b]/10 border-l-[6px] border-l-[#1b3b2b] shadow-xs hover:shadow-md hover:border-[#1b3b2b]/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Table Occupancy
              </span>
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 rounded-xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center group-hover:bg-[#1b3b2b] group-hover:text-white transition-colors duration-300"
              >
                <span className="material-symbols-outlined text-xl">table_restaurant</span>
              </motion.span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-[#1b3b2b] tracking-tight">
                {loading ? "..." : (metrics?.estimatedOccupancy || "0 / 24")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-neutral-700">
                {metrics?.todayReservations ?? 0} confirmed holds
              </span>
              <span className="text-[11px] text-neutral-400">• Floor capacity</span>
            </div>
          </motion.div>

          {/* Card 4: Menu Items */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#1b3b2b]/10 border-l-[6px] border-l-[#C05621] shadow-xs hover:shadow-md hover:border-[#C05621]/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Menu Active
              </span>
              <motion.span
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 rounded-xl bg-[#C05621]/10 text-[#C05621] flex items-center justify-center group-hover:bg-[#C05621] group-hover:text-white transition-colors duration-300"
              >
                <span className="material-symbols-outlined text-xl">menu_book</span>
              </motion.span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-[#1b3b2b] tracking-tight">
                {loading ? "..." : `${metrics?.activeMenuItems ?? 0} / ${metrics?.totalMenuItems ?? 0}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-neutral-700">
                Available now
              </span>
              <span className="text-[11px] text-neutral-400">• Live catalog</span>
            </div>
          </motion.div>

        </motion.div>

        {/* 3. Operational Consoles Fast Access Ribbon */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1b3b2b]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b3b2b]">
                Operations Consoles
              </h2>
            </div>
            <span className="text-xs text-neutral-400 font-medium">Quick navigation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/vendor/orders"
              className="group bg-white p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-2xs hover:shadow-md hover:border-[#1b3b2b]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 350 }}
                  className="w-11 h-11 rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center shadow-xs"
                >
                  <span className="material-symbols-outlined text-2xl">receipt_long</span>
                </motion.div>
                <h3 className="text-sm font-bold text-[#1b3b2b] mt-3.5 group-hover:text-[#C05621] transition-colors">
                  Kitchen Orders &amp; Queue
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Accept incoming orders, coordinate prep, and update real-time dispatch status.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#1b3b2b]">
                <span>Manage Orders</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/reservations"
              className="group bg-white p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-2xs hover:shadow-md hover:border-[#1b3b2b]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <motion.div
                  whileHover={{ scale: 1.08, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 350 }}
                  className="w-11 h-11 rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center shadow-xs"
                >
                  <span className="material-symbols-outlined text-2xl">event_seat</span>
                </motion.div>
                <h3 className="text-sm font-bold text-[#1b3b2b] mt-3.5 group-hover:text-[#C05621] transition-colors">
                  Reservations &amp; Seating
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Review upcoming guest seatings, table allocation, and dining room schedule.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#1b3b2b]">
                <span>Seat Management</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/manage-menu"
              className="group bg-white p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-2xs hover:shadow-md hover:border-[#1b3b2b]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 3 }}
                  transition={{ type: "spring", stiffness: 350 }}
                  className="w-11 h-11 rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center shadow-xs"
                >
                  <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
                </motion.div>
                <h3 className="text-sm font-bold text-[#1b3b2b] mt-3.5 group-hover:text-[#C05621] transition-colors">
                  Menu &amp; Specials
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Adjust pricing, upload food photography, update descriptions, and toggle availability.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#1b3b2b]">
                <span>Edit Catalog</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/vendor/manage-profile"
              className="group bg-white p-5 rounded-2xl border border-[#1b3b2b]/10 shadow-2xs hover:shadow-md hover:border-[#1b3b2b]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <motion.div
                  whileHover={{ scale: 1.08, rotate: -3 }}
                  transition={{ type: "spring", stiffness: 350 }}
                  className="w-11 h-11 rounded-xl bg-[#1b3b2b] text-white flex items-center justify-center shadow-xs"
                >
                  <span className="material-symbols-outlined text-2xl">storefront</span>
                </motion.div>
                <h3 className="text-sm font-bold text-[#1b3b2b] mt-3.5 group-hover:text-[#C05621] transition-colors">
                  Outlet Settings
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Configure operating hours, dining address, cuisine classifications, and merchant profile.
                </p>
              </div>
              <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#1b3b2b]">
                <span>Outlet Details</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* 4. Split Section: Live Orders Queue & Table Holds */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (7 cols): Real-Time Ticket Dispatch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 shadow-xs p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1b3b2b]/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 4, -4, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-9 h-9 rounded-xl bg-[#C05621]/10 text-[#C05621] flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl">receipt_long</span>
                  </motion.div>
                  <div>
                    <h3 className="text-base font-bold text-[#1b3b2b]">
                      Live Orders Queue
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Incoming tickets requiring kitchen action
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/vendor/orders"
                  className="text-xs font-bold text-[#C05621] hover:underline flex items-center gap-1"
                >
                  <span>Full Order Console</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>

              {loading ? (
                <div className="py-12 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-neutral-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : activeOrders.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1b3b2b]">All Tickets Clear</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                    The kitchen order queue is currently clear. New orders will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#1b3b2b]/5 mt-2">
                  <AnimatePresence mode="popLayout">
                    {activeOrders.map((ord) => {
                      const isPending = ord.status === "PENDING";
                      const isAccepted = ord.status === "ACCEPTED";
                      const isPrep = ord.status === "PREPARING";
                      const isActing = actionLoadingId === ord.id;

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.25 }}
                          key={ord.id}
                          className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-neutral-50/70 -mx-2 px-3 rounded-xl"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-[#1b3b2b]">
                                #{ord.id.slice(-6).toUpperCase()}
                              </span>

                              <span
                                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isPending
                                    ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                                    : isPrep
                                      ? "bg-blue-100 text-blue-900 border border-blue-200"
                                      : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                  }`}
                              >
                                {ord.status}
                              </span>

                              <span className="text-[11px] text-neutral-500 font-medium">
                                • {ord.orderType}
                              </span>
                            </div>

                            <p className="text-xs font-bold text-[#1b3b2b] truncate">
                              {ord.items?.map((item) => `${item.quantity}x ${item.name}`).join(", ") || "Order Items"}
                            </p>

                            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                              <span>
                                Guest:{" "}
                                <strong className="text-neutral-700 font-bold">
                                  {ord.user?.name || "Direct Diner"}
                                </strong>
                              </span>
                              {ord.user?.phone && <span>({ord.user.phone})</span>}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
                            <span className="text-base font-bold text-[#1b3b2b]">
                              ${Number(ord.total).toFixed(2)}
                            </span>

                            {isPending && (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleUpdateStatus(ord.id, "ACCEPTED")}
                                disabled={isActing}
                                className="px-4 py-1.5 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                {isActing ? "..." : "Accept"}
                              </motion.button>
                            )}

                            {isAccepted && (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleUpdateStatus(ord.id, "PREPARING")}
                                disabled={isActing}
                                className="px-4 py-1.5 rounded-xl bg-[#C05621] hover:bg-[#C05621]/90 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                {isActing ? "..." : "Start Cooking"}
                              </motion.button>
                            )}

                            {isPrep && (
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleUpdateStatus(ord.id, "DELIVERED")}
                                disabled={isActing}
                                className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                {isActing ? "..." : "Mark Ready"}
                              </motion.button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Performance Audit Sub-card */}
            <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 shadow-xs p-6">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#1b3b2b]/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1b3b2b] text-lg">verified</span>
                  <h3 className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider">
                    Service Shift Overview
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Kitchen Active
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
                <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                    Fulfilled Today
                  </span>
                  <span className="text-base font-bold text-[#1b3b2b] mt-0.5 block">
                    {metrics?.fulfilledCount ?? 0} tickets
                  </span>
                </div>
                <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                    Table Seating
                  </span>
                  <span className="text-base font-bold text-[#1b3b2b] mt-0.5 block">
                    {metrics?.estimatedOccupancy || "0 / 24"}
                  </span>
                </div>
                <div className="p-3.5 bg-neutral-50/80 rounded-xl border border-neutral-100">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                    Telemetry Sync
                  </span>
                  <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                    Live SSL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Table Holds & Team Allocation */}
          <div className="lg:col-span-5 space-y-6">

            {/* Table Holds Card */}
            <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 shadow-xs p-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#1b3b2b]/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-9 h-9 rounded-xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl">calendar_month</span>
                  </motion.div>
                  <div>
                    <h3 className="text-base font-bold text-[#1b3b2b]">
                      Upcoming Table Holds
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Confirmed dining room bookings
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/vendor/reservations"
                  className="text-xs font-bold text-[#C05621] hover:underline"
                >
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="py-8 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-neutral-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-2xl text-neutral-300 mb-1 block">
                    event_seat
                  </span>
                  <p className="text-xs font-bold text-neutral-500">No active table reservations today.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#1b3b2b]/5 mt-2">
                  <AnimatePresence mode="popLayout">
                    {reservations.map((res) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={res.id}
                        className="py-3.5 flex items-start justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-[#1b3b2b] block">
                            {res.user?.name || "Private Dining Guest"}
                          </span>
                          <span className="text-[11px] text-neutral-500 block">
                            {res.partySize} Guests • Table {res.tableNumber || "Open Floor"} ({res.seatingArea || "Dining Area"})
                          </span>
                          {res.specialNotes && (
                            <span className="text-[11px] text-[#C05621] italic line-clamp-1 block">
                              &ldquo;{res.specialNotes}&rdquo;
                            </span>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 block">
                            {res.time}
                          </span>
                          <span className="text-[9px] text-neutral-400 block mt-0.5">
                            {res.displayDate || res.date}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Shift Team Info Card */}
            <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 shadow-xs p-6">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#1b3b2b]/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1b3b2b] text-lg">badge</span>
                  <h3 className="text-xs font-bold text-[#1b3b2b] uppercase tracking-wider">
                    Staffing &amp; Shift Station
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Full Shift Ready
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-lg bg-[#1b3b2b] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs"
                    >
                      OP
                    </motion.div>
                    <div>
                      <span className="font-bold text-[#1b3b2b] block">Operations Manager</span>
                      <span className="text-[10px] text-neutral-400 block">Floor &amp; Table Controller</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    On Duty
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-lg bg-[#C05621] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs"
                    >
                      KC
                    </motion.div>
                    <div>
                      <span className="font-bold text-[#1b3b2b] block">Head Line Chef</span>
                      <span className="text-[10px] text-neutral-400 block">Kitchen Order Expediter</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Station Active
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1.5 text-neutral-500 text-[11px]">
                  <span>Kitchen Floor Support</span>
                  <span className="font-bold text-[#1b3b2b]">Active Dispatch Ready</span>
                </div>
              </div>
            </div>

          </div>

        </motion.div>

      </div>
    </motion.div>
  );
}