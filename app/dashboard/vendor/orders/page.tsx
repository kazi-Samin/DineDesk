"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

interface OrderItem {
  id: string;
  name: string;
  price: string | number;
  quantity: number;
}

interface UserInfo {
  id: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
}

interface OrderEntity {
  id: string;
  restaurantId: string;
  userId: string;
  orderType: "DELIVERY" | "PICKUP" | "DINE_IN";
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "REJECTED";
  paymentMethod: "STRIPE" | "COD";
  paymentStatus: "UNPAID" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: string | number;
  discount: string | number;
  deliveryFee: string | number;
  total: string | number;
  deliveryAddress?: string;
  createdAt: string;
  user?: UserInfo;
  items: OrderItem[];
}

interface AnalyticsMetrics {
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function VendorIncomingOrdersPage() {
  const [orders, setOrders] = useState<OrderEntity[]>([]);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetrics | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest">("newest");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [chimeEnabled, setChimeEnabled] = useState<boolean>(true);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const loadOrders = useCallback(async () => {
    try {
      const [analyticsRes, queueRes] = await Promise.all([
        fetch(`${API_BASE_URL}/orders/vendor/analytics`, {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch(`${API_BASE_URL}/orders/vendor/queue`, {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }),
      ]);

      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        if (json.data?.metrics) {
          setAnalyticsMetrics(json.data.metrics);
        }
      }

      if (queueRes.ok) {
        const json = await queueRes.json();
        const data: OrderEntity[] = json.data || [];
        setOrders(data);

        if (data.length > 0) {
          setSelectedOrderId((prev) => (prev && data.some((o) => o.id === prev) ? prev : data[0].id));
        }
      }
    } catch (err) {
      console.error("Failed to load kitchen order stream:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string, label: string) => {
    try {
      setActionLoadingId(orderId);
      const res = await fetch(`${API_BASE_URL}/orders/vendor/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        await loadOrders();
        showToast(`Ticket #${orderId.slice(-6).toUpperCase()} marked ${label}`);
      } else {
        showToast("Failed to update status. Please try again.");
      }
    } catch (err) {
      console.error("Order status update error:", err);
      showToast("Network error updating order.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "PENDING").length,
      accepted: orders.filter((o) => o.status === "ACCEPTED").length,
      preparing: orders.filter((o) => o.status === "PREPARING").length,
      out_for_delivery: orders.filter((o) => o.status === "OUT_FOR_DELIVERY").length,
      delivered: orders.filter((o) => o.status === "DELIVERED").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED" || o.status === "REJECTED").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (activeTab === "pending" && o.status !== "PENDING") return false;
        if (activeTab === "accepted" && o.status !== "ACCEPTED") return false;
        if (activeTab === "preparing" && o.status !== "PREPARING") return false;
        if (activeTab === "out_for_delivery" && o.status !== "OUT_FOR_DELIVERY") return false;
        if (activeTab === "delivered" && o.status !== "DELIVERED") return false;
        if (activeTab === "cancelled" && o.status !== "CANCELLED" && o.status !== "REJECTED") return false;

        if (fulfillmentFilter !== "all" && o.orderType.toLowerCase() !== fulfillmentFilter.toLowerCase()) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = o.id.toLowerCase().includes(q);
          const matchName = o.user?.name?.toLowerCase().includes(q);
          const matchPhone = o.user?.phone?.includes(q);
          const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
          if (!matchId && !matchName && !matchPhone && !matchItem) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // When looking at "all", keep active kitchen orders (PENDING, PREPARING, ACCEPTED) above CANCELLED orders
        if (activeTab === "all") {
          const isACancelled = a.status === "CANCELLED" || a.status === "REJECTED";
          const isBCancelled = b.status === "CANCELLED" || b.status === "REJECTED";
          if (isACancelled && !isBCancelled) return 1;
          if (!isACancelled && isBCancelled) return -1;
        }

        if (sortBy === "highest") return Number(b.total) - Number(a.total);
        if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [orders, activeTab, fulfillmentFilter, searchQuery, sortBy]);

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId && filteredOrders.length > 0) return filteredOrders[0];
    return filteredOrders.find((o) => o.id === selectedOrderId) || filteredOrders[0] || null;
  }, [selectedOrderId, filteredOrders]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full min-h-screen bg-[#FBFBFA] text-[#1b3b2b] pb-16 font-sans selection:bg-[#1b3b2b] selection:text-white"
    >
      {/* 1. Header Action Ribbon */}
      <section className="w-full bg-white/90 backdrop-blur-md border-b border-[#1b3b2b]/10 px-4 sm:px-6 lg:px-10 py-6 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">
              <span>Vendor Dashboard</span>
              <span>/</span>
              <span className="text-[#1b3b2b]">Live Order Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b3b2b]">
              Kitchen Queue &amp; Dispatch
            </h1>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Manage incoming customer orders from kitchen preparation to courier dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setChimeEnabled(!chimeEnabled);
                showToast(chimeEnabled ? "Kitchen bell muted." : "Kitchen chime alerts active.");
              }}
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-[#1b3b2b]/5 text-[#1b3b2b] text-xs font-bold transition-all border border-[#1b3b2b]/15 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                {chimeEnabled ? "notifications_active" : "notifications_off"}
              </span>
              <span>Kitchen Bell: <strong className="text-[#C05621]">{chimeEnabled ? "ON" : "MUTED"}</strong></span>
              {chimeEnabled && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </button>

            <button
              onClick={() => {
                setLoading(true);
                loadOrders();
              }}
              disabled={loading}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>
                refresh
              </span>
              <span>{loading ? "Refreshing..." : "Refresh Queue"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Executive Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 space-y-8">

        {/* Synchronized Telemetry KPI Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#1b3b2b]/10 border-l-[6px] border-l-[#1b3b2b] shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Shift Volume
              </span>
              <span className="w-9 h-9 rounded-xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">payments</span>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-[#1b3b2b] tracking-tight">
                {loading ? "..." : `$${Number(analyticsMetrics?.todayRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-800">
                {analyticsMetrics?.totalOrdersCount ?? orders.length} total orders recorded
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#1b3b2b]/10 border-l-[6px] border-l-[#C05621] shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Active Kitchen Queue
              </span>
              <span className="w-9 h-9 rounded-xl bg-[#C05621]/10 text-[#C05621] flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">skillet</span>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-[#C05621] tracking-tight">
                {loading ? "..." : (analyticsMetrics?.activePrepCount ?? tabCounts.pending + tabCounts.preparing + tabCounts.accepted)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C05621] animate-pulse" />
              <span className="text-[11px] font-bold text-[#C05621]">
                {tabCounts.pending} pending • {tabCounts.preparing + tabCounts.accepted} in prep
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#1b3b2b]/10 border-l-[6px] border-l-[#1b3b2b] shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                In Transit
              </span>
              <span className="w-9 h-9 rounded-xl bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">two_wheeler</span>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-[#1b3b2b] tracking-tight">
                {loading ? "..." : (analyticsMetrics?.inTransitCount ?? tabCounts.out_for_delivery)}
              </span>
            </div>
            <span className="text-[11px] font-bold text-neutral-700 mt-2 block">
              Active couriers dispatched
            </span>
          </div>

          <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-[#1b3b2b]/10 border-l-[6px] border-l-[#C05621] shadow-xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Fulfilled Today
              </span>
              <span className="w-9 h-9 rounded-xl bg-[#C05621]/10 text-[#C05621] flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">task_alt</span>
              </span>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold text-[#1b3b2b] tracking-tight">
                {loading ? "..." : (analyticsMetrics?.fulfilledCount ?? tabCounts.delivered)}
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 mt-2 block">
              Delivered successfully
            </span>
          </div>
        </motion.div>

        {/* 3. Primary Workspace: 2-Column Split */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

          {/* Left Column: Orders Stream & Filters */}
          <div className="xl:col-span-8 space-y-5">

            {/* Filter Bar with Full-Width Status Tabs & Expandable Search Icon */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#1b3b2b]/10 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto flex-1 min-w-0 py-0.5 scrollbar-none">
                {[
                  { key: "all", label: "All", count: tabCounts.all },
                  { key: "pending", label: "Pending", count: tabCounts.pending, alert: tabCounts.pending > 0 },
                  { key: "accepted", label: "Accepted", count: tabCounts.accepted },
                  { key: "preparing", label: "Prep", count: tabCounts.preparing },
                  { key: "out_for_delivery", label: "Transit", count: tabCounts.out_for_delivery },
                  { key: "delivered", label: "Delivered", count: tabCounts.delivered },
                  { key: "cancelled", label: "Cancelled", count: tabCounts.cancelled },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${activeTab === t.key
                        ? "bg-[#1b3b2b] text-white shadow-2xs"
                        : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                      }`}
                  >
                    <span>{t.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === t.key
                          ? "bg-white/20 text-white"
                          : t.alert
                            ? "bg-[#C05621] text-white animate-pulse"
                            : "bg-neutral-200 text-neutral-700"
                        }`}
                    >
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Expandable Search Icon */}
              <div className="flex items-center shrink-0 pl-1">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "180px", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mr-1"
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search ticket..."
                        className="w-full px-2.5 py-1.5 bg-neutral-50 rounded-xl text-xs text-[#1b3b2b] placeholder:text-neutral-400 border border-neutral-200 focus:outline-none focus:border-[#1b3b2b]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  title="Search orders"
                  onClick={() => {
                    setIsSearchOpen((prev) => {
                      const next = !prev;
                      if (next) {
                        setTimeout(() => searchInputRef.current?.focus(), 150);
                      } else {
                        setSearchQuery("");
                      }
                      return next;
                    });
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isSearchOpen || searchQuery
                      ? "bg-[#1b3b2b] text-white"
                      : "bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-[#1b3b2b] border border-neutral-200"
                    }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {isSearchOpen && searchQuery ? "close" : "search"}
                  </span>
                </button>
              </div>
            </div>

            {/* Secondary Controls Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 px-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1b3b2b]">Fulfillment:</span>
                {(["all", "delivery", "pickup", "dine_in"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFulfillmentFilter(m)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-colors cursor-pointer ${fulfillmentFilter === m
                        ? "bg-[#C05621] text-white"
                        : "bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200"
                      }`}
                  >
                    {m === "all" ? "All Modes" : m.replace("_", " ")}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1b3b2b]">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-neutral-200 rounded-lg px-2 py-1 text-xs font-bold text-[#1b3b2b] focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Amount ($)</option>
                </select>

                {(searchQuery || fulfillmentFilter !== "all" || activeTab !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                      setFulfillmentFilter("all");
                      setActiveTab("all");
                    }}
                    className="text-[#C05621] font-bold text-xs hover:underline ml-2 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-3">
              {loading ? (
                <div className="py-16 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 bg-white border border-[#1b3b2b]/10 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 p-16 text-center shadow-xs">
                  <span className="material-symbols-outlined text-4xl text-neutral-300 mb-2 block">
                    inbox
                  </span>
                  <h3 className="text-base font-bold text-[#1b3b2b]">No Orders Match Filters</h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                    Try adjusting your search criteria or switching to a different operational status tab.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                      setFulfillmentFilter("all");
                      setActiveTab("all");
                    }}
                    className="mt-4 px-4 py-2 bg-[#1b3b2b] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    View All Orders
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((ord) => {
                    const isSelected = selectedOrderId === ord.id;
                    const isPending = ord.status === "PENDING";
                    const isAccepted = ord.status === "ACCEPTED";
                    const isPreparing = ord.status === "PREPARING";
                    const isTransit = ord.status === "OUT_FOR_DELIVERY";
                    const isDelivered = ord.status === "DELIVERED";
                    const isCancelled = ord.status === "CANCELLED" || ord.status === "REJECTED";
                    const isActing = actionLoadingId === ord.id;

                    const borderColor = isPending || isPreparing ? "border-l-[#C05621]" : "border-l-[#1b3b2b]";

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        key={ord.id}
                        onClick={() => setSelectedOrderId(ord.id)}
                        className={`relative bg-white p-5 rounded-2xl border transition-all cursor-pointer border-l-[6px] ${borderColor} ${isSelected
                            ? "border-[#1b3b2b] shadow-md ring-2 ring-[#1b3b2b]/10"
                            : "border-[#1b3b2b]/10 shadow-xs hover:shadow-md hover:border-[#1b3b2b]/30"
                          }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          {/* Identifiers & Customer */}
                          <div className="space-y-1.5 min-w-[220px]">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-bold text-[#1b3b2b]">
                                #{ord.id.slice(-6).toUpperCase()}
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isPending
                                    ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                                    : isPreparing
                                      ? "bg-blue-100 text-blue-900 border border-blue-200"
                                      : isDelivered
                                        ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                        : "bg-neutral-100 text-neutral-800 border border-neutral-200"
                                  }`}
                              >
                                {ord.status.replace("_", " ")}
                              </span>

                              <span className="text-[11px] text-neutral-400 font-medium uppercase">
                                • {ord.orderType}
                              </span>
                            </div>

                            <div>
                              <span className="text-sm font-bold text-[#1b3b2b] block">
                                {ord.user?.name || "Customer"}
                              </span>
                              <span className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-xs">call</span>
                                {ord.user?.phone || "No direct phone"} • Placed at{" "}
                                {new Date(ord.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>

                          {/* Items Summary */}
                          <div className="flex-1 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                              {ord.items.reduce((s, i) => s + i.quantity, 0)} Items Ordered
                            </span>
                            <p className="text-xs text-[#1b3b2b] font-medium line-clamp-1">
                              {ord.items.map((i, idx) => (
                                <span key={i.id || idx}>
                                  <strong className="font-bold text-[#1b3b2b]">{i.quantity}x</strong> {i.name}
                                  {idx < ord.items.length - 1 ? ", " : ""}
                                </span>
                              ))}
                            </p>
                          </div>

                          {/* Bill & Actions */}
                          <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0">
                            <div className="text-right">
                              <span className="text-lg font-bold text-[#1b3b2b] block">
                                ${Number(ord.total).toFixed(2)}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md inline-block uppercase ${ord.paymentStatus === "PAID"
                                    ? "bg-emerald-50 text-emerald-800"
                                    : "bg-amber-50 text-amber-800"
                                  }`}
                              >
                                {ord.paymentMethod === "COD" ? "Pay on Delivery" : ord.paymentStatus}
                              </span>
                            </div>

                            {/* Direct Interactive Status Buttons */}
                            <div className="flex items-center gap-2">
                              {isPending && (
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(ord.id, "ACCEPTED", "Accepted");
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                                >
                                  {isActing ? "..." : "Accept"}
                                </button>
                              )}

                              {isAccepted && (
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(ord.id, "PREPARING", "In Kitchen (Prep)");
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#C05621] hover:bg-[#C05621]/90 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                                >
                                  {isActing ? "..." : "Start Prep"}
                                </button>
                              )}

                              {isPreparing && (
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(ord.id, "OUT_FOR_DELIVERY", "Out for Delivery");
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                                >
                                  {isActing ? "..." : "Dispatch"}
                                </button>
                              )}

                              {isTransit && (
                                <button
                                  type="button"
                                  disabled={isActing}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(ord.id, "DELIVERED", "Delivered");
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                                >
                                  {isActing ? "..." : "Delivered"}
                                </button>
                              )}

                              {isDelivered && (
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg">
                                  Completed
                                </span>
                              )}

                              {isCancelled && (
                                <span className="text-[11px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg">
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Right Column: Live KOT Ticket Drawer */}
          <div className="xl:col-span-4 sticky top-24 space-y-5">
            {selectedOrder ? (
              <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 shadow-md p-6 space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-[#1b3b2b]/10">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Active Live Ticket
                    </span>
                    <h3 className="text-xl font-bold text-[#1b3b2b] font-mono mt-0.5">
                      #{selectedOrder.id.slice(-6).toUpperCase()}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${selectedOrder.status === "PENDING"
                        ? "bg-amber-100 text-amber-900"
                        : selectedOrder.status === "PREPARING"
                          ? "bg-blue-100 text-blue-900"
                          : selectedOrder.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-neutral-100 text-neutral-800"
                      }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>

                {/* Customer & Fulfillment Info */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Customer:</span>
                    <strong className="text-[#1b3b2b]">{selectedOrder.user?.name || "Direct Guest"}</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Phone:</span>
                    <strong className="text-[#1b3b2b]">{selectedOrder.user?.phone || "None"}</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Mode:</span>
                    <strong className="text-[#C05621] uppercase">{selectedOrder.orderType}</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100">
                    <span className="text-neutral-500">Placed At:</span>
                    <span className="text-neutral-700 font-mono">
                      {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {selectedOrder.deliveryAddress && (
                    <div className="pt-1">
                      <span className="text-neutral-500 block mb-0.5">Address:</span>
                      <p className="text-neutral-700 font-medium leading-relaxed bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                        {selectedOrder.deliveryAddress}
                      </p>
                    </div>
                  )}
                </div>

                {/* Items Breakdown */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    Kitchen Order Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-50">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#1b3b2b]/5 text-[#1b3b2b] flex items-center justify-center font-bold text-[11px]">
                            {item.quantity}x
                          </span>
                          <span className="text-[#1b3b2b] font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-[#1b3b2b]">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bill Summary */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  {Number(selectedOrder.discount) > 0 && (
                    <div className="flex items-center justify-between text-[#C05621]">
                      <span>Discount</span>
                      <span>-${Number(selectedOrder.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Delivery Fee</span>
                    <span>${Number(selectedOrder.deliveryFee).toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-sm font-bold text-[#1b3b2b]">
                    <span>Total Amount</span>
                    <span>${Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Quick Print KOT Button */}
                <button
                  type="button"
                  onClick={() => showToast(`KOT Ticket #${selectedOrder.id.slice(-6).toUpperCase()} sent to kitchen thermal printer.`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] font-bold text-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span>Print KOT Kitchen Slip</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#1b3b2b]/10 p-12 text-center shadow-xs">
                <span className="material-symbols-outlined text-3xl text-neutral-300 mb-1 block">
                  receipt_long
                </span>
                <p className="text-xs text-neutral-400 font-medium">Select an order ticket to inspect details</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Floating Status Toast Notification */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1b3b2b] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 transition-all duration-300 z-50 ${toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
        <span className="text-xs font-bold">{toastMessage}</span>
      </div>
    </motion.div>
  );
}