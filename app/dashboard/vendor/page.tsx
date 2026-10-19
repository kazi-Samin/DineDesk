"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import VendorSidebar from "@/components/vendor/VendorSidebar";
import VendorHeader from "@/components/vendor/VendorHeader";
import { getVendorOrders, getOrderStatistics } from "@/services/mockOrderService";
import { getVendorReservations, getVendorTables, getReservationStats } from "@/services/mockVendorReservationService";
import { getMenuItems, getMenuSummaryStats } from "@/services/mockMenuService";
import { getRestaurantProfile } from "@/services/mockProfileService";
import { OrderConfirmation } from "@/types/order";
import { VendorReservation, TableEntity } from "@/types/reservation";
import { MenuItem } from "@/types/menu";
import { RestaurantProfile } from "@/types/profile";

import { useSidebarToggle } from "@/hooks/useSidebarToggle";

export default function VendorExecutiveDashboardPage() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_vendor_sidebar");
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [reservations, setReservations] = useState<VendorReservation[]>([]);
  const [tables, setTables] = useState<TableEntity[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadData = () => {
    const o = getVendorOrders("the-maple-and-vine");
    const r = getVendorReservations();
    const t = getVendorTables();
    const m = getMenuItems();
    const p = getRestaurantProfile();

    setOrders(o);
    setReservations(r);
    setTables(t);
    setMenuItems(m);
    setProfile(p);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const orderStats = useMemo(() => getOrderStatistics("the-maple-and-vine"), [orders]);
  const reservationStats = useMemo(() => getReservationStats(reservations, tables), [reservations, tables]);
  const menuStats = useMemo(() => getMenuSummaryStats(menuItems), [menuItems]);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed" || o.status === "preparing"
    );
  }, [orders]);

  const upcomingReservations = useMemo(() => {
    return reservations.filter((r) => r.status === "confirmed" || r.status === "pending").slice(0, 4);
  }, [reservations]);

  const occupiedTablesCount = useMemo(() => {
    return tables.filter((t) => t.status === "occupied" || t.status === "assigned").length;
  }, [tables]);

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md antialiased flex flex-col">
      {/* 1. Left Responsive Vendor Sidebar */}
      <VendorSidebar
        pendingCount={orderStats.newOrders}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />

      {/* 2. Top Header with Outlet Switcher and Online Toggle */}
      <VendorHeader
        restaurantName={profile?.name || "The Maple & Vine"}
        pendingCount={orderStats.newOrders}
        onRefresh={loadData}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* 3. Main Console Workspace */}
      <div className={`flex-1 flex flex-col pt-16 transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
        <main className="relative flex-1 bg-background">
          {/* Top Quick Status Strip */}
          <section className="w-full px-4 sm:px-6 lg:px-8 py-5 bg-surface-container-low border-b border-outline-variant">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Dinner Service Active • Evening Shift
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-on-surface mt-1">
                  {profile?.name || "The Maple & Vine"}
                </h1>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Michigan Avenue, Detroit, MI • Health Inspection Grade A+ • (313) 555-0142
                </p>
              </div>

              {/* 4 Quick Operational Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Today Revenue
                  </span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    ${orderStats.todayRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Active Orders
                  </span>
                  <span className="text-lg font-bold text-secondary mt-0.5 block">
                    {orderStats.newOrders + orderStats.preparing} in prep
                  </span>
                </div>

                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Table Occupancy
                  </span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    {occupiedTablesCount} / {tables.length || 24}
                  </span>
                </div>

                <div className="bg-surface-container-lowest px-4 py-2.5 rounded-lg border border-outline-variant shadow-2xs">
                  <span className="text-[11px] font-medium text-on-surface-variant block uppercase tracking-wider">
                    Menu Active
                  </span>
                  <span className="text-lg font-bold text-primary mt-0.5 block">
                    {menuStats.liveInKitchenCount} / {menuStats.totalDishes}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Main Dashboard Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* 4 Direct Operational Hub Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-primary tracking-tight">
                  Restaurant Operations Console
                </h2>
                <span className="text-xs text-on-surface-variant">
                  Select a section to manage live operations
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/dashboard/vendor/orders"
                  className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">receipt_long</span>
                    </div>
                    {orderStats.newOrders > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-on-secondary text-xs font-semibold animate-pulse">
                        {orderStats.newOrders} New
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-primary group-hover:text-primary transition-colors">
                      Live Orders &amp; Dispatch
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Accept incoming orders, dispatch couriers, and coordinate with kitchen team.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-xs text-primary font-semibold">
                    <span>Manage Orders</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/vendor/reservations"
                  className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">table_restaurant</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-xs font-medium">
                      {reservationStats.confirmedCovers} covers
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-primary group-hover:text-primary transition-colors">
                      Table Seating &amp; Floor
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Real-time 24-table floor plan matrix, guest seating, and walk-in arrivals.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-xs text-primary font-semibold">
                    <span>Floor Manager</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/vendor/manage-menu"
                  className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">menu_book</span>
                    </div>
                    {menuStats.soldOutTonightCount > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary-fixed text-secondary text-xs font-semibold">
                        {menuStats.soldOutTonightCount} Sold Out
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-primary group-hover:text-primary transition-colors">
                      Menu &amp; Specials
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Update dishes, seasonal prices, portion limits, and 1-click 86/sold-out toggles.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-xs text-primary font-semibold">
                    <span>Manage Menu</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </Link>

                <Link
                  href="/dashboard/vendor/manage-profile"
                  className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-2xs hover:shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl">settings</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed text-xs font-semibold">
                      Grade A+
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-primary group-hover:text-primary transition-colors">
                      Restaurant &amp; Operations Settings
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Dining room photos, shift schedules, service hours, and restaurant contact profile.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-xs text-primary font-semibold">
                    <span>Restaurant Settings</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Split Operations: Left Live Queue + Right Floor & Settlement */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (7 cols): Live Tickets Stream */}
              <div className="lg:col-span-7 space-y-6">
                {/* Active Orders Queue Card */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">
                        receipt_long
                      </span>
                      <h3 className="text-base font-bold text-primary">
                        Live Orders Queue ({activeOrders.length})
                      </h3>
                    </div>
                    <Link
                      href="/dashboard/vendor/orders"
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Full Order Console</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>

                  {activeOrders.length === 0 ? (
                    <div className="py-10 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl text-outline mb-1 block">
                        task_alt
                      </span>
                      <p className="text-sm font-medium">All active kitchen orders completed!</p>
                      <p className="text-xs mt-1">New incoming tickets will chime automatically.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-outline-variant">
                      {activeOrders.map((ord) => {
                        const isPending = ord.status === "pending";
                        const isPrep = ord.status === "preparing";

                        return (
                          <div key={ord.orderId} className="py-3.5 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-primary">
                                  #{ord.orderId}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                                    isPending
                                      ? "bg-secondary text-on-secondary animate-pulse"
                                      : isPrep
                                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                                      : "bg-primary-container text-on-primary"
                                  }`}
                                >
                                  {ord.status.replace("_", " ")}
                                </span>
                                <span className="text-xs text-on-surface-variant">
                                  • {ord.fulfillmentMode === "delivery" ? "Delivery Courier" : "Dine-in Order"}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-primary">
                                ${ord.total.toLocaleString()}
                              </span>
                            </div>

                            <div className="text-xs text-on-surface font-medium">
                              {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
                              <span>Customer: <strong className="text-on-surface font-semibold">{ord.contact.fullName}</strong> ({ord.contact.phone})</span>
                              <Link
                                href="/dashboard/vendor/orders"
                                className="px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-primary font-semibold border border-outline-variant transition-colors"
                              >
                                View Ticket
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Daily Dining Room & Kitchen Sales Performance */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                      <h3 className="text-base font-bold text-primary">
                        Daily Dining Room &amp; Kitchen Performance
                      </h3>
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium">
                      Service Shift: <strong className="text-primary">Dinner Active</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
                    <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                      <span className="text-[11px] text-on-surface-variant block uppercase font-medium">
                        Net Sales Today
                      </span>
                      <span className="text-lg font-bold text-primary mt-0.5 block">
                        $12,480
                      </span>
                      <span className="text-[10px] text-emerald-800 font-semibold">100% Reconciled</span>
                    </div>

                    <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant">
                      <span className="text-[11px] text-on-surface-variant block uppercase font-medium">
                        Food Cost Ratio
                      </span>
                      <span className="text-lg font-bold text-secondary mt-0.5 block">
                        28.5%
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-medium">Target 30% Max</span>
                    </div>

                    <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant col-span-2 sm:col-span-1">
                      <span className="text-[11px] text-on-surface-variant block uppercase font-medium">
                        Order Fulfillment
                      </span>
                      <span className="text-lg font-bold text-primary mt-0.5 block">
                        99.2%
                      </span>
                      <span className="text-[10px] text-primary font-semibold">Gold Standard</span>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Commercial operating account • Fifth Third Bank (Michigan Avenue Commercial Branch). Shift reconciliations recorded daily.
                  </p>
                </div>
              </div>

              {/* Right Column (5 cols): Table Reservations & Staffing */}
              <div className="lg:col-span-5 space-y-6">
                {/* Upcoming Table Bookings */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">
                        calendar_month
                      </span>
                      <h3 className="text-base font-bold text-primary">
                        Upcoming Table Holds
                      </h3>
                    </div>
                    <Link
                      href="/dashboard/vendor/reservations"
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="divide-y divide-outline-variant mt-2">
                    {upcomingReservations.map((res) => (
                      <div key={res.id} className="py-3 flex items-start justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-primary">
                            {res.guestName}
                          </span>
                          <span className="text-xs text-on-surface-variant mt-0.5">
                            {res.partySize} Guests • {res.reservationTime} • {res.preferredZone}
                          </span>
                          {res.guestNotes && (
                            <span className="text-[11px] text-secondary italic mt-0.5 line-clamp-1">
                              &ldquo;{res.guestNotes}&rdquo;
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${
                            res.status === "confirmed"
                              ? "bg-primary-container text-on-primary"
                              : "bg-surface-container text-on-surface"
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 mt-2 border-t border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
                    <span>Capacity: <strong>80 Seats</strong></span>
                    <span className="text-primary font-semibold">14 Tables Allocated</span>
                  </div>
                </div>

                {/* Restaurant Staff & Quality Audit Card */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-2xs p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-xl">
                        badge
                      </span>
                      <h3 className="text-base font-bold text-primary">
                        Shift Roster &amp; Team
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-surface-container px-2 py-0.5 rounded-md">
                      Full Shift On Duty
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-outline-variant">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-[10px]">
                          MV
                        </div>
                        <span className="font-semibold text-on-surface">Marcus Vance</span>
                      </div>
                      <span className="text-on-surface-variant">General Manager &amp; Operations Lead</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-outline-variant">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-[10px]">
                          SJ
                        </div>
                        <span className="font-semibold text-on-surface">Sarah Jenkins</span>
                      </div>
                      <span className="text-on-surface-variant">Dining Room Host Lead</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-on-surface-variant">Kitchen &amp; Floor Crew</span>
                      <span className="font-semibold text-primary">4 Line Chefs • 6 Dining Stewards</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
