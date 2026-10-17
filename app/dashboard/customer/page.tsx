"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import { getCustomerProfile } from "@/services/mockCustomerProfileService";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { getCustomerReservations } from "@/services/mockCustomerReservationService";
import { getSavedRestaurants, getSavedDishes } from "@/services/mockCustomerFavoritesService";
import { getMockOrders } from "@/services/mockOrderService";
import { CustomerProfileData } from "@/types/customerProfile";
import { CustomerReservation } from "@/types/customerReservation";
import { FavoriteRestaurant } from "@/types/customerFavorites";
import { OrderConfirmation } from "@/types/order";
import { useReservation } from "@/context/ReservationContext";
import { useCart } from "@/context/CartContext";

export default function CustomerDashboardOverviewPage() {
  const { openReservationModal } = useReservation();
  const { addItem, openDrawer } = useCart();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<CustomerProfileData>(INITIAL_CUSTOMER_PROFILE);
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const p = getCustomerProfile();
    const r = getCustomerReservations();
    const f = getSavedRestaurants();
    const o = getMockOrders();

    setProfile(p);
    setReservations(r);
    setFavorites(f);
    setOrders(o);
    setIsLoaded(true);
  }, []);

  const upcomingReservation = reservations.find(
    (res) => res.status === "confirmed" || res.status === "pending"
  );

  const activeOrder = orders.find(
    (ord) => ord.status !== "delivered" && ord.status !== "completed" && ord.status !== "cancelled"
  ) || orders[0];

  const recentOrders = orders.slice(0, 3);
  const topFavorites = favorites.slice(0, 3);

  return (
    <div className="bg-background min-h-screen text-on-surface flex flex-col font-body-md antialiased">
      {/* Top Fixed Customer Navigation Header */}
      <CustomerHeader
        userName={profile.fullName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Layout Container */}
      <div className="flex pt-16 flex-1">
        {/* Fixed Left Navigation Sidebar */}
        <CustomerSidebar
          userName={`${profile.fullName.split(" ")[0]}'s Account`}
          memberSince={profile.memberSince}
          avatarUrl={profile.avatarUrl}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeOrderCount={profile.stats.activeBookings}
          loyaltyPoints={profile.stats.loyaltyPoints}
        />

        {/* Main Content Area */}
        <main className="pl-0 lg:pl-72 flex-1 flex flex-col min-h-screen w-full">
          {/* Section 1: Patron Welcome Banner & Live Stats */}
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low border-b border-outline-variant/30">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-lg text-headline-lg text-primary font-bold tracking-tight">
                    Welcome back, {profile.fullName.split(" ")[0]}
                  </h1>
                  <span className="font-label-sm text-xs px-2.5 py-0.5 rounded-sm bg-primary-fixed text-on-primary-fixed font-semibold">
                    {profile.roleBadge}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {profile.email} • {profile.phone}
                </p>
              </div>

              {/* 4 Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <Link
                  href="/dashboard/customer/orders"
                  className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs hover:border-primary/40 transition-colors"
                >
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5 block">
                    {profile.stats.totalOrders}
                  </span>
                </Link>
                <Link
                  href="/dashboard/customer/reservations"
                  className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs hover:border-primary/40 transition-colors"
                >
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Bookings
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-semibold mt-0.5 block">
                    {profile.stats.activeBookings}
                  </span>
                </Link>
                <Link
                  href="/dashboard/customer/favorites"
                  className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs hover:border-primary/40 transition-colors"
                >
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Saved Spots
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold mt-0.5 block">
                    {profile.stats.savedSpots}
                  </span>
                </Link>
                <Link
                  href="/dashboard/customer/loyalty"
                  className="bg-surface-container-lowest px-space-md py-space-sm rounded-xl border border-outline-variant shadow-xs hover:border-primary/40 transition-colors"
                >
                  <span className="font-label-sm text-xs text-on-surface-variant block uppercase tracking-wider">
                    Loyalty Points
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-semibold mt-0.5 block">
                    {profile.stats.loyaltyPoints.toLocaleString()} pts
                  </span>
                </Link>
              </div>
            </div>
          </section>

          {/* Section 2: Core Dashboard Content */}
          <div className="w-full px-space-xl py-space-xl max-w-6xl mx-auto flex-1 flex flex-col gap-space-xl">
            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
              <Link
                href="/explore"
                className="p-space-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs hover:border-primary transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm font-semibold text-primary">Order Food</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Browse local spots</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() =>
                  openReservationModal({
                    id: "sultans-heritage",
                    name: "Sultan's Heritage Kitchen",
                    neighborhood: "Banani, Dhaka",
                  })
                }
                className="p-space-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs hover:border-primary transition-all flex items-center gap-3 group text-left cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">table_restaurant</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm font-semibold text-primary">Reserve Table</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Book ahead in Dhaka</p>
                </div>
              </button>

              <Link
                href="/dashboard/customer/addresses"
                className="p-space-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs hover:border-primary transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm font-semibold text-primary">Saved Addresses</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Delivery locations</p>
                </div>
              </Link>

              <Link
                href="/dashboard/customer/favorites"
                className="p-space-md bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs hover:border-primary transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container-low text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <span className="material-symbols-outlined text-lg">favorite</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-sm font-semibold text-primary">Saved Favorites</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">Kitchens &amp; dishes</p>
                </div>
              </Link>
            </div>

            {/* Active Dining Highlights: Order & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
              {/* Active Order Tracker */}
              {activeOrder ? (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-space-lg flex flex-col justify-between gap-space-md">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-semibold">
                          Active Order Status
                        </span>
                      </div>
                      <span className="font-mono text-xs text-on-surface-variant">
                        #{activeOrder.orderId}
                      </span>
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-headline-sm text-lg font-bold text-primary">
                          {activeOrder.restaurantName}
                        </h2>
                        <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                          {activeOrder.items.length} {activeOrder.items.length === 1 ? "item" : "items"}:{" "}
                          {activeOrder.items.map((i) => i.name).join(", ")}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-sm bg-primary-fixed text-on-primary-fixed text-xs font-medium shrink-0">
                        {activeOrder.status === "preparing" ? "Kitchen Preparing" : "Order Placed"}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm text-primary">
                          schedule
                        </span>
                        <span>Estimated Arrival: <strong className="text-on-surface">25–35 mins</strong></span>
                      </div>
                      <span className="font-bold text-primary text-sm">
                        ৳{activeOrder.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      Delivery to {profile.fullName.split(" ")[0]}&apos;s Default Address
                    </span>
                    <Link
                      href={`/order-confirmation/${activeOrder.orderId}`}
                      className="px-4 py-2 bg-primary-container hover:bg-primary text-on-primary rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>Live Tracker</span>
                      <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-space-lg flex flex-col items-center justify-center text-center gap-2 min-h-[220px]">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">
                    receipt_long
                  </span>
                  <h2 className="font-headline-sm text-base font-semibold text-primary">No Active Orders</h2>
                  <p className="font-body-sm text-xs text-on-surface-variant max-w-xs">
                    Satisfy your cravings from Dhaka&apos;s finest kitchens.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-2 px-4 py-2 bg-primary-container text-on-primary rounded-lg text-xs font-semibold hover:bg-primary transition-colors"
                  >
                    Explore Restaurants
                  </Link>
                </div>
              )}

              {/* Upcoming Reservation Card */}
              {upcomingReservation ? (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-space-lg flex flex-col justify-between gap-space-md">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-surface-tint animate-pulse" />
                        <span className="font-label-sm text-xs uppercase tracking-wider text-primary font-semibold">
                          Confirmed Table Hold
                        </span>
                      </div>
                      <span className="font-mono text-xs text-on-surface-variant">
                        REF #{upcomingReservation.id}
                      </span>
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-headline-sm text-lg font-bold text-primary">
                          {upcomingReservation.restaurantName}
                        </h2>
                        <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                          {upcomingReservation.neighborhood} • {upcomingReservation.seatingArea}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-sm bg-primary-fixed text-on-primary-fixed text-xs font-medium shrink-0">
                        Table {upcomingReservation.tableNumber || "Reserved"}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-surface-container-low rounded-lg border border-outline-variant/40 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-on-surface-variant block text-[11px]">Date</span>
                        <span className="font-semibold text-on-surface">{upcomingReservation.displayDate}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block text-[11px]">Time</span>
                        <span className="font-bold text-primary">{upcomingReservation.time}</span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block text-[11px]">Party</span>
                        <span className="font-semibold text-on-surface">{upcomingReservation.partySize} Diners</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      Valet Parking Available
                    </span>
                    <Link
                      href="/dashboard/customer/reservations"
                      className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-xs font-medium transition-colors border border-outline-variant/60 flex items-center gap-1"
                    >
                      <span>Digital Pass</span>
                      <span className="material-symbols-outlined text-xs">confirmation_number</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-space-lg flex flex-col items-center justify-center text-center gap-2 min-h-[220px]">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/50">
                    table_restaurant
                  </span>
                  <h2 className="font-headline-sm text-base font-semibold text-primary">No Upcoming Reservations</h2>
                  <p className="font-body-sm text-xs text-on-surface-variant max-w-xs">
                    Reserve a curated dining table for lunch or dinner tonight.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      openReservationModal({
                        id: "sultans-heritage",
                        name: "Sultan's Heritage Kitchen",
                        neighborhood: "Banani, Dhaka",
                      })
                    }
                    className="mt-2 px-4 py-2 bg-primary-container text-on-primary rounded-lg text-xs font-semibold hover:bg-primary transition-colors cursor-pointer"
                  >
                    Book a Table
                  </button>
                </div>
              )}
            </div>

            {/* Split Section: Recent Orders & Bookmarked Favorites */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              {/* Left Column: Recent Orders List (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline-sm text-base font-bold text-primary">
                    Recent Orders
                  </h2>
                  <Link
                    href="/dashboard/customer/orders"
                    className="font-label-sm text-xs text-primary underline underline-offset-4 hover:text-secondary font-semibold"
                  >
                    View All ({orders.length})
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  {recentOrders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-lg">receipt</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-headline-sm text-sm font-semibold text-primary">
                              {ord.restaurantName}
                            </h3>
                            <span className="px-2 py-0.5 rounded-sm bg-surface-container text-on-surface-variant text-[11px] font-medium">
                              #{ord.orderId}
                            </span>
                          </div>
                          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                            {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/30">
                        <span className="font-bold text-primary text-sm">
                          ৳{ord.total.toLocaleString()}
                        </span>
                        <Link
                          href={`/order-confirmation/${ord.orderId}`}
                          className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-xs font-medium transition-colors border border-outline-variant/60"
                        >
                          Receipt
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Loyalty Summary & Saved Spots (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                {/* Loyalty Tier Card */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-lg">
                        workspace_premium
                      </span>
                      <h2 className="font-headline-sm text-sm font-bold text-primary">
                        Gold Foodie Patron
                      </h2>
                    </div>
                    <Link
                      href="/dashboard/customer/loyalty"
                      className="font-label-sm text-xs text-primary underline underline-offset-4 hover:text-secondary font-medium"
                    >
                      Rewards
                    </Link>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-on-surface-variant">Points Progress</span>
                      <span className="font-semibold text-primary">{profile.stats.loyaltyPoints} / 2,000 pts</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-container rounded-full"
                        style={{ width: `${Math.min(100, (profile.stats.loyaltyPoints / 2000) * 100)}%` }}
                      />
                    </div>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-1.5">
                      Earn 550 more points to unlock Platinum VIP Priority Seating.
                    </p>
                  </div>
                </div>

                {/* Top Saved Spots */}
                <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-headline-sm text-sm font-bold text-primary">
                      Top Saved Spots
                    </h2>
                    <Link
                      href="/dashboard/customer/favorites"
                      className="font-label-sm text-xs text-primary underline underline-offset-4 hover:text-secondary font-medium"
                    >
                      See All ({favorites.length})
                    </Link>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {topFavorites.map((spot) => (
                      <div
                        key={spot.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={spot.image}
                            alt={spot.name}
                            className="w-10 h-10 rounded-md object-cover shrink-0 bg-surface-container"
                          />
                          <div className="min-w-0">
                            <h3 className="font-headline-sm text-xs font-semibold text-primary truncate">
                              {spot.name}
                            </h3>
                            <span className="text-[11px] text-on-surface-variant truncate block">
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
                          className="px-2.5 py-1 text-[11px] font-medium bg-primary-container hover:bg-primary text-on-primary rounded-md transition-colors shrink-0 shadow-xs cursor-pointer"
                        >
                          Book
                        </button>
                      </div>
                    ))}
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
