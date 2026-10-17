"use client";

import { useEffect, useState, useMemo } from "react";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import VendorSummaryCards from "@/components/vendor/VendorSummaryCards";
import OrderDetailDrawer from "@/components/vendor/OrderDetailDrawer";
import VendorActionDialogs from "@/components/vendor/VendorActionDialogs";
import {
  getVendorOrders,
  getOrderStatistics,
  acceptOrder,
  rejectOrder,
  updateMockOrderStatus,
  markOrderDelivered,
  simulateNewOrder,
} from "@/services/mockOrderService";
import { OrderConfirmation, OrderStatus, FulfillmentMode } from "@/types/order";

export default function VendorIncomingOrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>("DD-84920");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest">("newest");
  const [chimeEnabled, setChimeEnabled] = useState(true);

  // Modals & Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; orderId: string }>({
    isOpen: false,
    orderId: "",
  });
  const [deliverModal, setDeliverModal] = useState<{
    isOpen: boolean;
    orderId: string;
    isCOD: boolean;
    amount: number;
  }>({
    isOpen: false,
    orderId: "",
    isCOD: false,
    amount: 0,
  });

  const loadOrders = () => {
    const list = getVendorOrders("sultans-heritage");
    setOrders(list);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Dynamic Statistics
  const stats = useMemo(() => {
    return getOrderStatistics("sultans-heritage");
  }, [orders]);

  // Selected Order Object
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId && orders.length > 0) return orders[0];
    return orders.find((o) => o.orderId === selectedOrderId) || orders[0] || null;
  }, [selectedOrderId, orders]);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Tab Status Filter
        if (activeTab === "new" && o.status !== "pending") return false;
        if (activeTab === "accepted" && o.status !== "confirmed") return false;
        if (activeTab === "preparing" && o.status !== "preparing") return false;
        if (
          activeTab === "out_for_delivery" &&
          o.status !== "out_for_delivery" &&
          o.status !== "ready"
        )
          return false;
        if (
          activeTab === "delivered" &&
          o.status !== "delivered" &&
          o.status !== "completed"
        )
          return false;
        if (
          activeTab === "cancelled" &&
          o.status !== "rejected" &&
          o.status !== "cancelled"
        )
          return false;

        // Fulfillment Type Filter
        if (fulfillmentFilter !== "all" && o.fulfillmentMode !== fulfillmentFilter) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = o.orderId.toLowerCase().includes(q);
          const matchName = o.contact.fullName.toLowerCase().includes(q);
          const matchPhone = o.contact.phone.includes(q);
          const matchItem = o.items.some((i) => i.name.toLowerCase().includes(q));
          if (!matchId && !matchName && !matchPhone && !matchItem) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "highest") return b.total - a.total;
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [orders, activeTab, fulfillmentFilter, searchQuery, sortBy]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => o.status === "pending").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      out_for_delivery: orders.filter(
        (o) => o.status === "out_for_delivery" || o.status === "ready"
      ).length,
      delivered: orders.filter(
        (o) => o.status === "delivered" || o.status === "completed"
      ).length,
      cancelled: orders.filter(
        (o) => o.status === "rejected" || o.status === "cancelled"
      ).length,
    };
  }, [orders]);

  // Actions
  const handleAcceptOrder = (orderId: string) => {
    const updated = acceptOrder(orderId);
    if (updated) {
      loadOrders();
      showToast(`Order #${orderId} accepted and dispatched to Kitchen KOT!`);
    }
  };

  const handlePromptReject = (orderId: string) => {
    setRejectModal({ isOpen: true, orderId });
  };

  const handleConfirmReject = (orderId: string, reason: string) => {
    const updated = rejectOrder(orderId, reason);
    if (updated) {
      loadOrders();
      setRejectModal({ isOpen: false, orderId: "" });
      showToast(`Order #${orderId} rejected: "${reason}"`);
    }
  };

  const handleStartPrep = (orderId: string) => {
    const updated = updateMockOrderStatus(orderId, "preparing");
    if (updated) {
      loadOrders();
      showToast(`Order #${orderId} marked In Kitchen (Preparing).`);
    }
  };

  const handleMarkReady = (orderId: string) => {
    const updated = updateMockOrderStatus(orderId, "ready");
    if (updated) {
      loadOrders();
      showToast(`Order #${orderId} is boxed & ready for dispatch.`);
    }
  };

  const handleMarkOutForDelivery = (orderId: string) => {
    const updated = updateMockOrderStatus(orderId, "out_for_delivery");
    if (updated) {
      loadOrders();
      showToast(`Order #${orderId} dispatched with dedicated courier.`);
    }
  };

  const handlePromptDelivered = (orderId: string) => {
    const target = orders.find((o) => o.orderId === orderId);
    if (!target) return;
    setDeliverModal({
      isOpen: true,
      orderId,
      isCOD: target.paymentMethod === "cod" && target.paymentStatus !== "paid",
      amount: target.total,
    });
  };

  const handleConfirmDeliver = (orderId: string, paymentCollected: boolean) => {
    const updated = markOrderDelivered(orderId, paymentCollected);
    if (updated) {
      loadOrders();
      setDeliverModal({ isOpen: false, orderId: "", isCOD: false, amount: 0 });
      showToast(`Order #${orderId} marked Delivered successfully!`);
    }
  };

  const handlePrintKOT = (orderId: string) => {
    showToast(`KOT Ticket #${orderId} sent to Kitchen Printer 1.`);
  };

  const handleSimulateNewOrder = () => {
    const newOrd = simulateNewOrder("sultans-heritage");
    loadOrders();
    setSelectedOrderId(newOrd.orderId);
    showToast(`Simulated new incoming order #${newOrd.orderId} from ${newOrd.contact.fullName}!`);
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* 1. Left Sidebar for Restaurant Owner */}
      <VendorSidebar
        pendingCount={stats.newOrders}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Top Header with Outlet Switcher and Online Toggle */}
      <div className="lg:pl-72">
        <VendorHeader
          restaurantName="Sultan's Heritage Kitchen"
          pendingCount={stats.newOrders}
          onRefresh={loadOrders}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* 3. Main Console Workspace */}
        <main className="relative pt-16 bg-background min-h-screen">
          <div className="flex flex-col w-full px-space-md sm:px-space-lg lg:px-space-xl py-space-lg max-w-[1440px] mx-auto gap-space-lg">
            {/* Header & Controls Strip */}
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md pb-space-sm border-b border-outline-variant/30">
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">
                    <span>Vendor Dashboard</span>
                    <span>/</span>
                    <span className="text-primary font-semibold">Orders</span>
                  </div>
                  <h1 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl text-primary tracking-tight font-display font-medium">
                    Incoming Orders
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Manage customer orders from placement to delivery.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-space-sm self-start md:self-auto">
                  {/* Simulate New Order Dev Button */}
                  <button
                    onClick={handleSimulateNewOrder}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary text-on-secondary hover:bg-secondary/90 font-label-md text-label-md font-semibold transition-all shadow-xs cursor-pointer"
                    type="button"
                    title="Simulate a new incoming customer order for testing"
                  >
                    <span className="material-symbols-outlined text-base">add_circle</span>
                    <span>Simulate New Order</span>
                  </button>

                  {/* Kitchen Chime Toggle */}
                  <button
                    onClick={() => {
                      setChimeEnabled(!chimeEnabled);
                      showToast(
                        chimeEnabled
                          ? "Kitchen bell muted."
                          : "Kitchen sound notifications enabled."
                      );
                    }}
                    className="flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer border border-outline-variant"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg text-primary font-semibold">
                      {chimeEnabled ? "notifications_active" : "notifications_off"}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-medium hidden sm:inline">
                      Kitchen Bell:{" "}
                      <strong className="text-primary">{chimeEnabled ? "ON" : "MUTED"}</strong>
                    </span>
                    {chimeEnabled && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping ml-1"></span>
                    )}
                  </button>

                  {/* Batch KOT Print */}
                  <button
                    onClick={() => showToast("Sent all active kitchen tickets to thermal KOT.")}
                    className="flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer border border-outline-variant"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg text-on-surface-variant">
                      print
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-medium hidden sm:inline">
                      Batch KOT Print
                    </span>
                  </button>
                </div>
              </div>

              {/* 4. Metric Statistic Cards */}
              <VendorSummaryCards stats={stats} />
            </div>

            {/* 5. Primary Workspace: 2-Column Split (Orders Stream + Live KOT Drawer) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
              {/* Left / Center Column (8 cols on XL) */}
              <div className="xl:col-span-8 flex flex-col gap-space-md">
                {/* Segmented Status Tabs & Search Bar */}
                <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-2xs border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-space-sm">
                  {/* Status Tabs */}
                  <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                        activeTab === "all"
                          ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                      type="button"
                    >
                      All Orders ({tabCounts.all})
                    </button>

                    <button
                      onClick={() => setActiveTab("new")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                        activeTab === "new"
                          ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                      type="button"
                    >
                      <span>New Requests</span>
                      {tabCounts.new > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-secondary text-on-secondary font-label-sm text-[10px] font-bold">
                          {tabCounts.new}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab("preparing")}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                        activeTab === "preparing"
                          ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                      type="button"
                    >
                      Preparing ({tabCounts.preparing})
                    </button>

                    <button
                      onClick={() => setActiveTab("out_for_delivery")}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                        activeTab === "out_for_delivery"
                          ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                      type="button"
                    >
                      Out for Delivery ({tabCounts.out_for_delivery})
                    </button>

                    <button
                      onClick={() => setActiveTab("delivered")}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                        activeTab === "delivered"
                          ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                      type="button"
                    >
                      Delivered ({tabCounts.delivered})
                    </button>

                    <button
                      onClick={() => setActiveTab("cancelled")}
                      className={`px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
                        activeTab === "cancelled"
                          ? "bg-primary-container text-on-primary font-semibold shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                      }`}
                      type="button"
                    >
                      Rejected / Cancelled ({tabCounts.cancelled})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full md:w-64">
                    <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-base">
                      search
                    </span>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low rounded-md font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:bg-surface-container-lowest border border-outline-variant transition-all"
                      placeholder="Search Order #, diner name..."
                      type="text"
                    />
                  </div>
                </div>

                {/* Additional Secondary Filters Strip */}
                <div className="flex flex-wrap items-center justify-between gap-space-sm px-1 text-[13px] text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">Fulfillment:</span>
                    {(["all", "delivery", "takeaway", "dinein"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFulfillmentFilter(m)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                          fulfillmentFilter === m
                            ? "bg-primary text-on-primary font-semibold"
                            : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                        }`}
                      >
                        {m === "all" ? "All Types" : m}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="p-1 bg-surface-container-lowest border border-outline-variant/40 rounded text-[12px] font-medium text-on-surface"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Value (৳)</option>
                    </select>

                    {(searchQuery || fulfillmentFilter !== "all" || activeTab !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setFulfillmentFilter("all");
                          setActiveTab("all");
                        }}
                        className="text-secondary hover:underline text-[12px] font-medium ml-2 cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Orders List / Table Container */}
                <div className="flex flex-col gap-space-sm">
                  {filteredOrders.length === 0 ? (
                    <div className="bg-surface-container-lowest p-12 rounded-xl text-center border border-outline-variant/40">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                        inbox
                      </span>
                      <h3 className="font-headline-sm text-primary">No Orders Match Filters</h3>
                      <p className="text-body-sm text-on-surface-variant mt-1">
                        Try resetting your search query or switching to another queue tab.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setFulfillmentFilter("all");
                          setActiveTab("all");
                        }}
                        className="mt-4 px-4 py-2 bg-primary-container text-on-primary rounded font-label-md font-semibold text-sm cursor-pointer"
                      >
                        View All Orders
                      </button>
                    </div>
                  ) : (
                    filteredOrders.map((ord) => {
                      const isSelected = selectedOrderId === ord.orderId;
                      const isPending = ord.status === "pending";
                      const isPreparing = ord.status === "preparing";
                      const isReady = ord.status === "ready";
                      const isOut = ord.status === "out_for_delivery";
                      const isDelivered = ord.status === "delivered" || ord.status === "completed";
                      const isRejected = ord.status === "rejected" || ord.status === "cancelled";

                      // Left border indicator accent
                      const borderAccent = isPending
                        ? "bg-secondary"
                        : isPreparing
                        ? "bg-amber-500"
                        : isReady || isOut
                        ? "bg-blue-600"
                        : isDelivered
                        ? "bg-emerald-600"
                        : "bg-outline-variant";

                      return (
                        <div
                          key={ord.orderId}
                          onClick={() => setSelectedOrderId(ord.orderId)}
                          className={`order-card bg-surface-container-lowest p-space-md rounded-xl shadow-xs hover:shadow-md transition-all relative overflow-hidden cursor-pointer border ${
                            isSelected
                              ? "border-primary-container ring-1 ring-primary-container/40"
                              : "border-outline-variant/40"
                          }`}
                        >
                          {/* Accent Bar */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${borderAccent}`}></div>

                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pl-space-xs">
                            {/* Left Meta Info */}
                            <div className="flex flex-col gap-1 min-w-[200px]">
                              <div className="flex items-center gap-2">
                                <span className="font-headline-sm text-headline-sm font-display text-primary font-bold">
                                  #{ord.orderId}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-label-sm text-[11px] font-semibold ${
                                    isPending
                                      ? "bg-secondary/10 text-secondary"
                                      : isPreparing
                                      ? "bg-amber-100 text-amber-900"
                                      : isOut || isReady
                                      ? "bg-blue-50 text-blue-900"
                                      : isDelivered
                                      ? "bg-emerald-50 text-emerald-900"
                                      : "bg-surface-container text-on-surface-variant"
                                  }`}
                                >
                                  {isPending && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                                  )}
                                  {ord.status.replace(/_/g, " ")}
                                </span>
                              </div>

                              <div className="flex flex-col">
                                <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                                  {ord.contact.fullName}
                                </span>
                                <span className="font-body-sm text-[12px] text-on-surface-variant flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">call</span>
                                  {ord.contact.phone} •{" "}
                                  <span className="capitalize">{ord.fulfillmentMode}</span>
                                </span>
                              </div>
                            </div>

                            {/* Middle Items Summary */}
                            <div className="flex-1 flex flex-col bg-surface-container-low p-space-sm rounded-lg border border-outline-variant/20">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                                  {ord.items.reduce((s, i) => s + i.quantity, 0)} Items Ordered
                                </span>
                                {ord.specialInstructions && (
                                  <span className="font-label-sm text-[11px] text-secondary font-semibold bg-secondary-fixed/40 px-1.5 rounded truncate max-w-[220px]">
                                    {ord.specialInstructions}
                                  </span>
                                )}
                              </div>
                              <p className="font-body-sm text-[13px] text-on-surface line-clamp-1">
                                {ord.items.map((i, idx) => (
                                  <span key={i.id}>
                                    <strong className="font-semibold text-primary">
                                      {i.quantity}x
                                    </strong>{" "}
                                    {i.name}
                                    {idx < ord.items.length - 1 ? ", " : ""}
                                  </span>
                                ))}
                              </p>
                            </div>

                            {/* Right: Bill & Actions */}
                            <div className="flex items-center justify-between lg:justify-end gap-space-md">
                              <div className="flex flex-col text-right">
                                <span className="font-headline-sm text-headline-sm font-display text-primary font-bold">
                                  ৳ {ord.total.toLocaleString()}
                                </span>
                                <span
                                  className={`font-label-sm text-[11px] px-1.5 py-0.5 rounded flex items-center justify-end gap-0.5 ${
                                    ord.paymentStatus === "paid"
                                      ? "text-emerald-800 bg-emerald-50"
                                      : "text-amber-800 bg-amber-50"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-xs">
                                    {ord.paymentMethod === "cod" ? "payments" : "credit_card"}
                                  </span>
                                  {ord.paymentStatus === "paid"
                                    ? "Paid"
                                    : ord.paymentMethod === "cod"
                                    ? "Pay on Delivery"
                                    : "Pending"}
                                </span>
                              </div>

                              {/* Interactive Actions */}
                              <div className="flex items-center gap-space-xs">
                                {isPending && (
                                  <>
                                    <button
                                      className="px-3.5 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAcceptOrder(ord.orderId);
                                      }}
                                      type="button"
                                    >
                                      <span className="material-symbols-outlined text-base">check</span>
                                      <span>Accept</span>
                                    </button>
                                    <button
                                      className="px-3 py-2 rounded-lg bg-surface-container-high text-secondary hover:bg-secondary hover:text-on-secondary font-label-md text-label-md font-medium transition-all cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePromptReject(ord.orderId);
                                      }}
                                      type="button"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}

                                {ord.status === "confirmed" && (
                                  <button
                                    className="px-3.5 py-2 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartPrep(ord.orderId);
                                    }}
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-base">skillet</span>
                                    <span>Start Prep</span>
                                  </button>
                                )}

                                {isPreparing && (
                                  <button
                                    className="px-3.5 py-2 rounded-lg bg-surface-container-highest text-primary hover:bg-primary-container hover:text-on-primary font-label-md text-label-md font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkReady(ord.orderId);
                                    }}
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-base">soup_kitchen</span>
                                    <span>Mark Ready</span>
                                  </button>
                                )}

                                {isReady && (
                                  <button
                                    className="px-3.5 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 font-label-md text-label-md font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (ord.fulfillmentMode === "delivery") {
                                        handleMarkOutForDelivery(ord.orderId);
                                      } else {
                                        handlePromptDelivered(ord.orderId);
                                      }
                                    }}
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-base">
                                      {ord.fulfillmentMode === "delivery" ? "two_wheeler" : "done"}
                                    </span>
                                    <span>
                                      {ord.fulfillmentMode === "delivery" ? "Dispatch" : "Complete"}
                                    </span>
                                  </button>
                                )}

                                {isOut && (
                                  <button
                                    className="px-3.5 py-2 rounded-lg bg-surface-container-high text-primary hover:bg-emerald-800 hover:text-white font-label-md text-label-md font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePromptDelivered(ord.orderId);
                                    }}
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-base">done_all</span>
                                    <span>Delivered</span>
                                  </button>
                                )}

                                {isDelivered && (
                                  <button
                                    className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md font-medium transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedOrderId(ord.orderId);
                                    }}
                                    type="button"
                                  >
                                    Details
                                  </button>
                                )}

                                {isRejected && (
                                  <span className="text-[11px] text-error font-medium px-2 py-1 bg-error/10 rounded">
                                    Rejected / Voided
                                  </span>
                                )}

                                <button
                                  className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintKOT(ord.orderId);
                                  }}
                                  type="button"
                                  title="Print KOT Ticket"
                                >
                                  <span className="material-symbols-outlined text-lg">print</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Live KOT Ticket & Inspection Drawer (4 cols on XL) */}
              <div className="xl:col-span-4 flex flex-col gap-space-md sticky top-20">
                <OrderDetailDrawer
                  order={selectedOrder}
                  isOpen={Boolean(selectedOrder)}
                  onClose={() => setSelectedOrderId(null)}
                  onAccept={handleAcceptOrder}
                  onRejectPrompt={handlePromptReject}
                  onStartPrep={handleStartPrep}
                  onMarkReady={handleMarkReady}
                  onMarkOutForDelivery={handleMarkOutForDelivery}
                  onMarkDeliveredPrompt={handlePromptDelivered}
                  onPrintKOT={handlePrintKOT}
                />

                {/* Quick Kitchen Fleet Tip Widget */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex items-center gap-space-sm">
                  <div className="p-2.5 rounded-xl bg-surface-container text-primary">
                    <span className="material-symbols-outlined text-2xl">electric_moped</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      3 Express Couriers Nearby
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant">
                      Average dispatch pickup time at Banani outlet is 4 mins.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Modals */}
          <VendorActionDialogs
            rejectModal={rejectModal}
            onCloseReject={() => setRejectModal({ isOpen: false, orderId: "" })}
            onConfirmReject={handleConfirmReject}
            deliverModal={deliverModal}
            onCloseDeliver={() => setDeliverModal({ isOpen: false, orderId: "", isCOD: false, amount: 0 })}
            onConfirmDeliver={handleConfirmDeliver}
          />

          {/* Floating Toast Notification */}
          <div
            className={`fixed bottom-space-xl left-1/2 -translate-x-1/2 bg-primary-container text-on-primary px-space-md py-3 rounded-xl shadow-2xl flex items-center gap-space-sm transition-all duration-300 z-50 ${
              toastMessage
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
            <span className="font-label-md text-label-md font-semibold">{toastMessage}</span>
          </div>
        </main>
      </div>
    </div>
  );
}
