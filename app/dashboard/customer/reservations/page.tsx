"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ProfileToast from "@/components/customer/profile/ProfileToast";
import DigitalSeatingPassModal from "@/components/customer/reservations/DigitalSeatingPassModal";
import ModifyReservationModal from "@/components/customer/reservations/ModifyReservationModal";
import CancelReservationModal from "@/components/customer/reservations/CancelReservationModal";
import DirectionsModal from "@/components/customer/reservations/DirectionsModal";
import ReservationStatusModal from "@/components/customer/reservations/ReservationStatusModal";
import RateSeatingModal from "@/components/customer/reservations/RateSeatingModal";

import {
  CustomerReservation,
  ReservationTabFilter,
} from "@/types/customerReservation";
import {
  getCustomerReservations,
  updateReservation,
  cancelCustomerReservation,
  rateCustomerReservation,
  exportReservationsToCSV,
} from "@/services/mockCustomerReservationService";
import { getCustomerProfile } from "@/services/mockCustomerProfileService";
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { useReservation } from "@/context/ReservationContext";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";

const ITEMS_PER_PAGE = 5;

export default function CustomerReservationsPage() {
  const router = useRouter();
  const { openReservationModal } = useReservation();

  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");

  // Profile data for header & stats
  const [profile, setProfile] = useState(INITIAL_CUSTOMER_PROFILE);

  // Reservations state
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<ReservationTabFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [passModalRes, setPassModalRes] = useState<CustomerReservation | null>(null);
  const [modifyModalRes, setModifyModalRes] = useState<CustomerReservation | null>(null);
  const [cancelModalRes, setCancelModalRes] = useState<CustomerReservation | null>(null);
  const [directionsModalRes, setDirectionsModalRes] = useState<CustomerReservation | null>(null);
  const [statusModalRes, setStatusModalRes] = useState<CustomerReservation | null>(null);
  const [rateModalRes, setRateModalRes] = useState<CustomerReservation | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{
    message: string | null;
    type: "success" | "error" | "info";
  }>({ message: null, type: "success" });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) =>
        prev.message === message ? { ...prev, message: null } : prev
      );
    }, 3800);
  };

  // Load from local storage
  useEffect(() => {
    const loadedProfile = getCustomerProfile();
    const loadedReservations = getCustomerReservations();
    setProfile(loadedProfile);
    setReservations(loadedReservations);
    setIsLoaded(true);
  }, []);

  // Compute upcoming featured reservation
  const featuredReservation = useMemo(() => {
    // Find first confirmed upcoming reservation
    return (
      reservations.find(
        (r) => r.isFeaturedUpcoming && r.status === "confirmed"
      ) ||
      reservations.find((r) => r.status === "confirmed") ||
      null
    );
  }, [reservations]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: reservations.length,
      upcoming: reservations.filter((r) => r.status === "confirmed").length,
      pending: reservations.filter((r) => r.status === "pending").length,
      past: reservations.filter((r) => r.status === "completed").length,
      cancelled: reservations.filter(
        (r) => r.status === "cancelled" || r.status === "declined"
      ).length,
    };
  }, [reservations]);

  // Filtered reservations based on active tab and search query
  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      // Tab filter
      if (activeTab === "upcoming" && res.status !== "confirmed") return false;
      if (activeTab === "pending" && res.status !== "pending") return false;
      if (activeTab === "past" && res.status !== "completed") return false;
      if (
        activeTab === "cancelled" &&
        res.status !== "cancelled" &&
        res.status !== "declined"
      )
        return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchVenue = res.restaurantName.toLowerCase().includes(query);
        const matchRef = res.id.toLowerCase().includes(query);
        const matchLocation = res.neighborhood.toLowerCase().includes(query);
        const matchNotes = res.specialNotes?.toLowerCase().includes(query) || false;
        if (!matchVenue && !matchRef && !matchLocation && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [reservations, activeTab, searchQuery]);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredReservations.length / ITEMS_PER_PAGE) || 1;
  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReservations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReservations, currentPage]);

  // Actions
  const handleSaveModification = (updated: CustomerReservation) => {
    const list = updateReservation(reservations, updated);
    setReservations(list);
    setModifyModalRes(null);
    showToast(
      `Seating hold for "${updated.restaurantName}" updated to ${updated.displayDate}.`
    );
  };

  const handleConfirmCancellation = () => {
    if (!cancelModalRes) return;
    const list = cancelCustomerReservation(reservations, cancelModalRes.id);
    setReservations(list);
    const targetName = cancelModalRes.restaurantName;
    setCancelModalRes(null);
    showToast(`Seating hold for "${targetName}" has been cancelled.`, "info");
  };

  const handleSubmitRating = (
    reservationId: string,
    rating: number,
    comment?: string
  ) => {
    const list = rateCustomerReservation(reservations, reservationId, rating, comment);
    setReservations(list);
    setRateModalRes(null);
    showToast(`Thank you! Your ${rating}-star dining review has been submitted.`);
  };

  const handleBookAgain = (restaurant: {
    id: string;
    name: string;
    neighborhood: string;
  }) => {
    openReservationModal(restaurant);
  };

  const handleDownloadTranscript = () => {
    if (filteredReservations.length === 0) {
      showToast("No reservation records to download in this view.", "info");
      return;
    }
    const success = exportReservationsToCSV(filteredReservations);
    if (success) {
      showToast(
        `Exported ${filteredReservations.length} reservation records to CSV.`
      );
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Top Fixed Customer Navigation Header */}
      <CustomerHeader
        userName={profile.fullName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      {/* Fixed Left Customer Navigation Sidebar */}
      <CustomerSidebar
        userName={`${profile.fullName.split(" ")[0]}'s Account`}
        memberSince={profile.memberSince}
        avatarUrl={profile.avatarUrl}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        activeOrderCount={profile.stats.activeBookings}
        loyaltyPoints={profile.stats.loyaltyPoints}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "pl-0"}`}>
        <main className="w-full pt-16 bg-background min-h-screen">
          {/* Section 1: Patron Welcome Banner & Stats */}
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low shadow-[0_1px_4px_rgba(0,0,0,0.02)] border-b border-outline-variant/20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <span className="font-display-mobile md:font-headline-lg text-headline-lg text-on-surface font-medium">
                  Welcome back, {profile.fullName.split(" ")[0]}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {profile.email} • {profile.phone}
                </span>
              </div>

              {/* 4 Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Total Orders
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {profile.stats?.totalOrders ?? 28}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Active Bookings
                  </span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-semibold">
                    {tabCounts.upcoming}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Saved Spots
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                    {profile.stats?.savedSpots ?? 14}
                  </span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">
                    Loyalty Points
                  </span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-semibold">
                    {profile.stats?.loyaltyPoints?.toLocaleString() ?? "1,450"} pts
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Page Title & Introduction */}
          <div className="w-full px-space-xl py-space-lg max-w-7xl mx-auto">
            <div className="flex flex-col gap-space-xl w-full">
              {/* Introduction Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                <div className="flex flex-col gap-1">
                  <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">
                    Table Reservations
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                    View and manage your upcoming table bookings and past dining visits.
                  </p>
                </div>
                <div className="flex items-center gap-space-sm self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() =>
                      openReservationModal({
                        id: "sultans-heritage",
                        name: "Sultan's Heritage Kitchen",
                        neighborhood: "Banani, Dhaka",
                      })
                    }
                    className="inline-flex items-center gap-space-xs px-space-md py-2.5 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary transition-colors shadow-xs font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">
                      add
                    </span>
                    <span>Book a New Table</span>
                  </button>
                </div>
              </div>

              {/* Featured Upcoming Reservation Card */}
              {featuredReservation ? (
                <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-xs p-space-lg md:p-space-xl border border-outline-variant">
                  <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-container/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center relative z-10">
                    {/* Left: Image Card with overlays */}
                    <div className="lg:col-span-4 relative rounded-lg overflow-hidden h-56 lg:h-64 shadow-sm">
                      <img
                        className="w-full h-full object-cover"
                        alt={featuredReservation.restaurantName}
                        src={featuredReservation.restaurantImage}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-primary">
                        <span className="font-label-sm text-label-sm bg-surface/90 text-primary px-2.5 py-1 rounded-md backdrop-blur-sm font-medium">
                          {featuredReservation.seatingArea}
                        </span>
                        <span className="font-label-sm text-label-sm flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-sm text-surface-tint">
                            verified
                          </span>{" "}
                          Verified Hold
                        </span>
                      </div>
                    </div>

                    {/* Right: Info & Actions */}
                    <div className="lg:col-span-8 flex flex-col justify-between h-full gap-space-md">
                      <div className="flex flex-wrap items-center justify-between gap-space-sm">
                        <div className="inline-flex items-center gap-space-xs px-2.5 py-1 bg-primary-fixed text-on-primary-fixed rounded-md font-label-sm text-label-sm font-semibold">
                          <span className="w-2 h-2 rounded-full bg-surface-tint animate-pulse" />
                          <span>
                            {featuredReservation.upcomingDaysLabel || "Upcoming Seating Confirmed"}
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-mono font-medium">
                          CONFIRMATION REF: #{featuredReservation.id}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <h2 className="font-headline-md text-headline-md text-primary font-bold">
                          {featuredReservation.restaurantName}
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-secondary">
                            location_on
                          </span>
                          {featuredReservation.fullAddress} • Valet Available
                        </p>
                      </div>

                      {/* 4 Details in warm box */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md py-space-sm bg-surface-container-low rounded-lg px-space-md border border-outline-variant/30">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Date
                          </span>
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                            {featuredReservation.displayDate}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Time Slot
                          </span>
                          <span className="font-label-lg text-label-lg text-primary font-bold">
                            {featuredReservation.time}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Party Size
                          </span>
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                            {featuredReservation.partySize} Diners
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Special Instruction
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary font-medium truncate">
                            {featuredReservation.specialNotes || "Standard Dining"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                        <button
                          type="button"
                          onClick={() => setPassModalRes(featuredReservation)}
                          className="px-space-md py-2 bg-primary-container text-on-primary rounded-lg font-label-sm text-label-sm hover:bg-primary transition-colors flex items-center gap-1.5 shadow-sm font-semibold"
                        >
                          <span className="material-symbols-outlined text-sm">
                            confirmation_number
                          </span>
                          <span>Digital Seating Pass</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setModifyModalRes(featuredReservation)}
                          className="px-space-md py-2 bg-surface-container-high text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors flex items-center gap-1.5 font-medium border border-outline-variant/40"
                        >
                          <span className="material-symbols-outlined text-sm">
                            edit_calendar
                          </span>
                          <span>Modify Time / Covers</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDirectionsModalRes(featuredReservation)}
                          className="px-space-md py-2 bg-surface-container-high text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors flex items-center gap-1.5 font-medium border border-outline-variant/40"
                        >
                          <span className="material-symbols-outlined text-sm">
                            directions
                          </span>
                          <span>Directions</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancelModalRes(featuredReservation)}
                          className="px-space-md py-2 text-error hover:bg-error-container hover:text-on-error-container rounded-lg font-label-sm text-label-sm transition-colors ml-auto font-medium"
                        >
                          Cancel Hold
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-xl p-space-xl border border-dashed border-outline-variant/60 flex flex-col items-center justify-center text-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
                    event_seat
                  </span>
                  <h3 className="font-headline-sm text-lg text-primary font-semibold">
                    No Upcoming Reservations
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant max-w-md">
                    You currently have no upcoming table holds. Reserve a table at premier culinary houses across Dhaka to experience curated seasonal seating.
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
                    className="mt-2 px-space-lg py-2 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary transition-colors shadow-xs"
                  >
                    Book a Table Tonight
                  </button>
                </div>
              )}

              {/* Section 3: Filter Tabs & History Table */}
              <div className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                  {/* 5 Filter Tabs */}
                  <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl overflow-x-auto border border-outline-variant/30">
                    {[
                      { id: "all", label: "All Bookings", count: tabCounts.all },
                      { id: "upcoming", label: "Upcoming / Confirmed", count: tabCounts.upcoming },
                      { id: "pending", label: "Pending Confirmation", count: tabCounts.pending },
                      { id: "past", label: "Past Visited", count: tabCounts.past },
                      { id: "cancelled", label: "Declined / Cancelled", count: tabCounts.cancelled },
                    ].map((tab) => {
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id as ReservationTabFilter)}
                          className={`booking-tab px-space-md py-1.5 rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-all ${
                            isActive
                              ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                              : "text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          {tab.label}{" "}
                          <span
                            className={`ml-1 font-normal ${
                              isActive ? "text-primary font-semibold" : "text-on-surface-variant"
                            }`}
                          >
                            ({tab.count})
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Bar & CSV Download */}
                  <div className="flex items-center gap-space-sm">
                    <div className="relative flex-1 sm:w-64">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                        search
                      </span>
                      <input
                        className="w-full pl-8 pr-space-md py-1.5 bg-surface-container-lowest font-body-sm text-body-sm text-on-surface rounded-md placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-container border border-outline-variant shadow-2xs"
                        placeholder="Filter by venue or reference..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button
                      className="p-2 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface rounded-md shadow-2xs border border-outline-variant transition-colors"
                      title="Download Dining Transcript"
                      type="button"
                      onClick={handleDownloadTranscript}
                    >
                      <span className="material-symbols-outlined text-base">
                        download
                      </span>
                    </button>
                  </div>
                </div>

                {/* Reservation Table Card */}
                <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-body-sm text-on-surface">
                      <thead>
                        <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm tracking-wide uppercase border-b border-outline-variant">
                          <th className="w-[18%] py-3 px-space-lg">Ref &amp; Date</th>
                          <th className="w-[26%] py-3 px-space-md">Venue &amp; Location</th>
                          <th className="w-[16%] py-3 px-space-md">Party &amp; Area</th>
                          <th className="w-[16%] py-3 px-space-md">Dietary / Notes</th>
                          <th className="w-[12%] py-3 px-space-md">Seating Status</th>
                          <th className="w-[12%] py-3 px-space-lg text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {paginatedReservations.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-12 px-space-lg text-center text-on-surface-variant"
                            >
                              <span className="material-symbols-outlined text-3xl mb-1 text-on-surface-variant/40 block">
                                search_off
                              </span>
                              <p className="font-label-md text-sm font-medium">
                                No reservation records match your filter criteria.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab("all");
                                  setSearchQuery("");
                                }}
                                className="mt-2 text-xs text-primary underline font-semibold"
                              >
                                Reset all filters
                              </button>
                            </td>
                          </tr>
                        ) : (
                          paginatedReservations.map((item, idx) => {
                            const isConfirmed = item.status === "confirmed";
                            const isPending = item.status === "pending";
                            const isCompleted = item.status === "completed";
                            const isCancelled =
                              item.status === "cancelled" || item.status === "declined";

                            return (
                              <tr
                                key={item.id}
                                className={`transition-colors hover:bg-surface-container-low/60 ${
                                  idx % 2 === 1 ? "bg-surface-container-low/20" : ""
                                }`}
                              >
                                {/* Ref & Date */}
                                <td className="py-space-md px-space-lg">
                                  <div className="flex flex-col">
                                    <span
                                      className={`font-label-sm text-label-sm font-mono ${
                                        isCancelled ? "text-outline" : "text-primary font-semibold"
                                      }`}
                                    >
                                      #{item.id}
                                    </span>
                                    <span className="font-body-sm text-body-sm text-on-surface font-medium">
                                      {item.displayDate}
                                    </span>
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                                      {item.time}
                                    </span>
                                  </div>
                                </td>

                                {/* Venue & Location */}
                                <td className="py-space-md px-space-md">
                                  <div className="flex flex-col">
                                    <span className="font-headline-sm text-body-lg text-on-surface font-semibold">
                                      {item.restaurantName}
                                    </span>
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                                      {item.neighborhood} • {item.tableNumber ? `Table ${item.tableNumber}` : item.seatingArea}
                                    </span>
                                  </div>
                                </td>

                                {/* Party & Area */}
                                <td className="py-space-md px-space-md">
                                  <div className="flex items-center gap-space-xs">
                                    <span
                                      className={`material-symbols-outlined text-base ${
                                        isCancelled
                                          ? "text-outline"
                                          : "text-primary-container"
                                      }`}
                                    >
                                      group
                                    </span>
                                    <span>{item.partySize} Guests</span>
                                    <span className="text-on-surface-variant text-label-sm">
                                      ({item.seatingArea.replace(/ Seating #.*/, "")})
                                    </span>
                                  </div>
                                </td>

                                {/* Dietary / Notes */}
                                <td className="py-space-md px-space-md max-w-xs">
                                  {item.specialNotes ? (
                                    <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 italic">
                                      &ldquo;{item.specialNotes}&rdquo;
                                    </span>
                                  ) : (
                                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                                      No notes provided
                                    </span>
                                  )}
                                </td>

                                {/* Status Badge */}
                                <td className="py-space-md px-space-md">
                                  {isConfirmed && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed font-semibold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-surface-tint" />
                                      Confirmed
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-label-sm text-label-sm bg-secondary-fixed text-on-secondary-fixed font-semibold">
                                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                      Pending Venue
                                    </span>
                                  )}
                                  {isCompleted && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant font-medium">
                                      <span className="material-symbols-outlined text-xs">
                                        done_all
                                      </span>
                                      Completed
                                    </span>
                                  )}
                                  {isCancelled && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-label-sm text-label-sm bg-error-container text-on-error-container font-medium">
                                      <span className="material-symbols-outlined text-xs">
                                        close
                                      </span>
                                      {item.statusDisplay}
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-space-md px-space-lg text-right">
                                  <div className="inline-flex items-center justify-end gap-space-xs">
                                    {isConfirmed && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setPassModalRes(item)}
                                          className="px-2.5 py-1 text-on-surface hover:bg-surface-container font-label-sm text-label-sm rounded-lg transition-colors font-medium border border-outline-variant/40"
                                        >
                                          Voucher
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setModifyModalRes(item)}
                                          className="px-2.5 py-1 text-primary-container hover:bg-primary-fixed/30 font-label-sm text-label-sm rounded-lg transition-colors font-semibold border border-primary-container/20"
                                        >
                                          Modify
                                        </button>
                                      </>
                                    )}

                                    {isPending && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setStatusModalRes(item)}
                                          className="px-2.5 py-1 text-on-surface hover:bg-surface-container font-label-sm text-label-sm rounded-lg transition-colors font-medium border border-outline-variant/40"
                                        >
                                          Status
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setCancelModalRes(item)}
                                          className="px-2.5 py-1 text-error hover:bg-error-container hover:text-on-error-container font-label-sm text-label-sm rounded-lg transition-colors font-semibold"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                    )}

                                    {isCompleted && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setRateModalRes(item)}
                                          className="px-2.5 py-1 text-secondary hover:bg-secondary-fixed/30 font-label-sm text-label-sm rounded-lg transition-colors font-semibold border border-secondary/20"
                                        >
                                          {item.rating ? `Rated (${item.rating}★)` : "Rate Seating"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleBookAgain({
                                              id: item.restaurantId,
                                              name: item.restaurantName,
                                              neighborhood: item.neighborhood,
                                            })
                                          }
                                          className="px-2.5 py-1 text-on-surface hover:bg-surface-container font-label-sm text-label-sm rounded-lg transition-colors font-medium border border-outline-variant/40"
                                        >
                                          Book Again
                                        </button>
                                      </>
                                    )}

                                    {isCancelled && (
                                      <Link
                                        href="/explore"
                                        className="px-2.5 py-1 text-primary-container hover:bg-surface-container font-label-sm text-label-sm rounded-lg transition-colors font-semibold border border-primary-container/30"
                                      >
                                        Find Alternative
                                      </Link>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="md:hidden flex flex-col divide-y divide-outline-variant/30 p-space-sm">
                    {paginatedReservations.length === 0 ? (
                      <div className="p-space-lg text-center text-on-surface-variant">
                        <p className="font-label-md text-sm">No reservation records found.</p>
                      </div>
                    ) : (
                      paginatedReservations.map((item) => {
                        const isConfirmed = item.status === "confirmed";
                        const isPending = item.status === "pending";
                        const isCompleted = item.status === "completed";
                        const isCancelled =
                          item.status === "cancelled" || item.status === "declined";

                        return (
                          <div key={item.id} className="py-space-md flex flex-col gap-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-mono text-xs text-primary font-bold">
                                  #{item.id}
                                </span>
                                <h4 className="font-headline-sm text-base font-bold text-primary">
                                  {item.restaurantName}
                                </h4>
                                <span className="font-body-sm text-xs text-on-surface-variant">
                                  {item.displayDate} • {item.time}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  isConfirmed
                                    ? "bg-primary-fixed text-on-primary-fixed"
                                    : isPending
                                    ? "bg-secondary-fixed text-on-secondary-fixed"
                                    : isCompleted
                                    ? "bg-surface-container-high text-on-surface-variant"
                                    : "bg-error-container text-on-error-container"
                                }`}
                              >
                                {item.statusDisplay}
                              </span>
                            </div>

                            <div className="text-xs text-on-surface-variant flex items-center justify-between">
                              <span>Party: {item.partySize} Guests</span>
                              <span>Area: {item.seatingArea}</span>
                            </div>

                            {item.specialNotes && (
                              <p className="text-xs text-on-surface-variant italic bg-surface-container-low p-2 rounded">
                                &ldquo;{item.specialNotes}&rdquo;
                              </p>
                            )}

                            {/* Mobile action bar */}
                            <div className="flex items-center gap-2 pt-1">
                              {isConfirmed && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setPassModalRes(item)}
                                    className="flex-1 py-1 text-center border border-outline-variant/60 rounded text-xs font-medium"
                                  >
                                    Voucher
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setModifyModalRes(item)}
                                    className="flex-1 py-1 text-center bg-primary-container text-on-primary rounded text-xs font-medium"
                                  >
                                    Modify
                                  </button>
                                </>
                              )}
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setStatusModalRes(item)}
                                    className="flex-1 py-1 text-center border border-outline-variant/60 rounded text-xs font-medium"
                                  >
                                    Status
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCancelModalRes(item)}
                                    className="flex-1 py-1 text-center bg-error text-on-error rounded text-xs font-medium"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {isCompleted && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setRateModalRes(item)}
                                    className="flex-1 py-1 text-center border border-secondary text-secondary rounded text-xs font-medium"
                                  >
                                    {item.rating ? `Rated (${item.rating}★)` : "Rate"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleBookAgain({
                                        id: item.restaurantId,
                                        name: item.restaurantName,
                                        neighborhood: item.neighborhood,
                                      })
                                    }
                                    className="flex-1 py-1 text-center bg-primary text-on-primary rounded text-xs font-medium"
                                  >
                                    Book Again
                                  </button>
                                </>
                              )}
                              {isCancelled && (
                                <Link
                                  href="/explore"
                                  className="flex-1 py-1 text-center bg-surface-container border border-outline-variant rounded text-xs font-medium text-primary text-center"
                                >
                                  Find Alternative
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination Footer */}
                  <div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant border-t border-outline-variant/20">
                    <span className="font-label-sm text-label-sm">
                      Showing {paginatedReservations.length} of {filteredReservations.length} reservation records recorded in Dhaka
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        className={`px-2 py-1 rounded font-label-sm text-label-sm transition-colors ${
                          currentPage <= 1
                            ? "bg-surface-container text-on-surface opacity-50 cursor-not-allowed"
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container"
                        }`}
                        disabled={currentPage <= 1}
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`px-2.5 py-1 rounded font-label-sm text-label-sm transition-colors ${
                            currentPage === page
                              ? "bg-primary text-on-primary font-semibold"
                              : "bg-surface-container-lowest text-on-surface hover:bg-surface-container"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        className={`px-2 py-1 rounded font-label-sm text-label-sm transition-colors ${
                          currentPage >= totalPages
                            ? "bg-surface-container text-on-surface opacity-50 cursor-not-allowed"
                            : "bg-surface-container-lowest text-on-surface hover:bg-surface-container"
                        }`}
                        disabled={currentPage >= totalPages}
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Bottom Informational Cards (Grace Period, Patron Rewards, Maitre d') */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* Card 1 */}
                <div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 flex items-start gap-space-md">
                  <span className="material-symbols-outlined text-primary-container text-2xl shrink-0 mt-0.5">
                    policy
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                      Grace Period &amp; Cancellation
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Reservations can be modified or cancelled without fees up to 2 hours before dining. Table holds expire 15 minutes past slot.
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 flex items-start gap-space-md">
                  <span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-0.5">
                    award_star
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                      Patron Rewards Accrual
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Each honored seating credits 150 points directly to your DineDesk balance. Redeem points for off-menu dessert tastings.
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 flex items-start gap-space-md">
                  <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">
                    support_agent
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                      Priority Maitre d&apos; Desk
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Planning a gathering exceeding 8 diners? Connect directly with our private dining sommelier for curated set courses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Footer */}
          <CustomerFooter />
        </main>
      </div>

      {/* Interactive Modal Dialogs */}
      <DigitalSeatingPassModal
        isOpen={Boolean(passModalRes)}
        reservation={passModalRes}
        onClose={() => setPassModalRes(null)}
      />

      <ModifyReservationModal
        isOpen={Boolean(modifyModalRes)}
        reservation={modifyModalRes}
        onClose={() => setModifyModalRes(null)}
        onSave={handleSaveModification}
      />

      <CancelReservationModal
        isOpen={Boolean(cancelModalRes)}
        reservation={cancelModalRes}
        onClose={() => setCancelModalRes(null)}
        onConfirm={handleConfirmCancellation}
      />

      <DirectionsModal
        isOpen={Boolean(directionsModalRes)}
        reservation={directionsModalRes}
        onClose={() => setDirectionsModalRes(null)}
      />

      <ReservationStatusModal
        isOpen={Boolean(statusModalRes)}
        reservation={statusModalRes}
        onClose={() => setStatusModalRes(null)}
      />

      <RateSeatingModal
        isOpen={Boolean(rateModalRes)}
        reservation={rateModalRes}
        onClose={() => setRateModalRes(null)}
        onSubmit={handleSubmitRating}
      />

      {/* Floating Action Feedback Toast */}
      <ProfileToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: "success" })}
      />
    </div>
  );
}
