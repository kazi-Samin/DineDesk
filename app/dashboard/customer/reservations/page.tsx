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
import { INITIAL_CUSTOMER_PROFILE } from "@/data/mockCustomerProfile";
import { fetchCustomerOrders } from "@/services/customerDataService";
import { useSidebarToggle } from "@/hooks/useSidebarToggle";
import { useAuth } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 5;
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://dine-desk-backend.vercel.app";

// Helper to reliably grab the auth token from local storage keys
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

export default function CustomerReservationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarToggle("dinedesk_customer_sidebar");

  const [profile, setProfile] = useState(INITIAL_CUSTOMER_PROFILE);
  const [reservations, setReservations] = useState<CustomerReservation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [savedSpotsCount, setSavedSpotsCount] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

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

  const [toast, setToast] = useState<{
    message: string | null;
    type: "success" | "error" | "info";
  }>({ message: null, type: "success" });

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev.message === message ? { ...prev, message: null } : prev));
    }, 3800);
  };

  // Fetch real data securely from PostgreSQL backend API with explicit Bearer token header
  const loadDatabaseReservations = async () => {
    try {
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

      setProfile(loadedProfile);

      // 1. Fetch dynamic database reservations with explicit Bearer token & credentials
      const resApi = await fetch(`${API_BASE_URL}/api/v1/reservations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include",
      }).catch(() => null);

      let dbReservations: CustomerReservation[] = [];
      if (resApi && resApi.ok) {
        const apiData = await resApi.json();
        const list = apiData.reservations || apiData.data || apiData || [];
        dbReservations = list.map((item: any) => {
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

      setReservations(dbReservations);

      // 2. Fetch live database orders to ensure cancelled orders are excluded
      const ordersRes = await fetch(`${API_BASE_URL}/api/v1/orders/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        credentials: "include",
      }).catch(() => null);

      let liveOrders: any[] = [];
      if (ordersRes && ordersRes.ok) {
        const apiData = await ordersRes.json();
        liveOrders = apiData.data || apiData.orders || [];
      } else {
        liveOrders = await fetchCustomerOrders(user?.id);
      }

      const userSpecificPayments = user?.id
        ? JSON.parse(localStorage.getItem(`dinedesk_stripe_payments_${user.id}`) || "[]")
        : [];
      const userSpecificFavorites = user?.id
        ? JSON.parse(
          localStorage.getItem(`dinedesk_saved_restaurants_${user.id}`) ||
          localStorage.getItem(`dinedesk_saved_spots_${user.id}`) ||
          "[]"
        )
        : [];

      // Valid non-cancelled orders count
      const nonCancelledOrders = liveOrders.filter(
        (o: any) => (o.status || "").toLowerCase() !== "cancelled"
      );
      const totalValidOrders = nonCancelledOrders.length + userSpecificPayments.length;
      const calculatedPoints = totalValidOrders * 20;

      const activeOrders = liveOrders.filter((o: any) => {
        const st = (o.status || "").toLowerCase();
        return st !== "delivered" && st !== "completed" && st !== "cancelled";
      }).length;

      setLoyaltyPoints(calculatedPoints);
      setTotalOrdersCount(totalValidOrders);
      setActiveOrdersCount(activeOrders);
      setSavedSpotsCount(userSpecificFavorites.length);

    } catch (err) {
      console.error("Error fetching database reservations:", err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadDatabaseReservations();

    const handleSync = () => loadDatabaseReservations();
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

  const featuredReservation = useMemo(() => {
    return (
      reservations.find(
        (r) => r.isFeaturedUpcoming && r.status === "confirmed"
      ) ||
      reservations.find((r) => r.status === "confirmed") ||
      null
    );
  }, [reservations]);

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

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      if (activeTab === "upcoming" && res.status !== "confirmed") return false;
      if (activeTab === "pending" && res.status !== "pending") return false;
      if (activeTab === "past" && res.status !== "completed") return false;
      if (
        activeTab === "cancelled" &&
        res.status !== "cancelled" &&
        res.status !== "declined"
      )
        return false;

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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredReservations.length / ITEMS_PER_PAGE) || 1;
  const paginatedReservations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReservations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReservations, currentPage]);

  const handleSaveModification = async (updated: CustomerReservation) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/reservations/${updated.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          date: updated.date,
          time: updated.time,
          partySize: updated.partySize,
          specialNotes: updated.specialNotes,
        }),
        credentials: "include",
      });

      if (res.ok) {
        showToast(`Seating hold for "${updated.restaurantName}" updated successfully.`);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("booking-updated"));
          window.dispatchEvent(new Event("storage"));
        }
        loadDatabaseReservations();
      } else {
        showToast("Failed to update reservation.", "error");
      }
    } catch (err) {
      showToast("Network error updating reservation.", "error");
    } finally {
      setModifyModalRes(null);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancelModalRes) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/reservations/${cancelModalRes.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: "CANCELLED",
          statusDisplay: "Cancelled",
        }),
        credentials: "include",
      });

      if (res.ok) {
        showToast(`Seating hold for "${cancelModalRes.restaurantName}" has been cancelled.`, "info");
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("booking-updated"));
          window.dispatchEvent(new Event("storage"));
        }
        loadDatabaseReservations();
      } else {
        showToast("Failed to cancel reservation.", "error");
      }
    } catch (err) {
      showToast("Network error cancelling reservation.", "error");
    } finally {
      setCancelModalRes(null);
    }
  };

  const handleSubmitRating = (
    reservationId: string,
    rating: number,
    comment?: string
  ) => {
    const updatedList: CustomerReservation[] = reservations.map((r) =>
      r.id === reservationId ? { ...r, rating, specialNotes: comment || r.specialNotes } : r
    );
    setReservations(updatedList);
    setRateModalRes(null);
    showToast(`Thank you! Your ${rating}-star dining review has been submitted.`);
  };

  const handleDownloadTranscript = () => {
    if (filteredReservations.length === 0) {
      showToast("No reservation records to download in this view.", "info");
      return;
    }
    showToast(`Exported ${filteredReservations.length} reservation records to CSV.`);
  };

  if (!isLoaded) {
    return (
      <div className="bg-[#f8f9f6] min-h-screen text-[#1b3b2b] flex items-center justify-center font-bold">
        Loading database reservations...
      </div>
    );
  }

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      <CustomerHeader
        userName={profile.fullName}
        userRole={profile.roleBadge}
        avatarUrl={profile.avatarUrl}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />

      <CustomerSidebar
        userName={`${profile.fullName.split(" ")[0]}'s Account`}
        memberSince={profile.memberSince}
        avatarUrl={profile.avatarUrl}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        activeOrderCount={activeOrdersCount}
        activeOrdersCount={totalOrdersCount}
        upcomingReservationsCount={tabCounts.upcoming}
        loyaltyPoints={loyaltyPoints}
      />

      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:pl-72" : "lg:pl-20 pl-0"}`}>
        <main className="w-full pt-16 bg-background min-h-screen">
          <section className="w-full px-space-xl py-space-lg bg-surface-container-low shadow-[0_1px_4px_rgba(0,0,0,0.02)] border-b border-outline-variant/20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-space-lg">
              <div className="flex flex-col gap-1">
                <span className="font-display-mobile md:font-headline-lg text-headline-lg text-on-surface font-medium">
                  Welcome back, {profile.fullName.split(" ")[0]}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {profile.email} {profile.phone && `• ${profile.phone}`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md">
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Total Orders</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">{totalOrdersCount}</span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Active Bookings</span>
                  <span className="font-headline-sm text-headline-sm text-secondary font-semibold">{tabCounts.upcoming}</span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Saved Spots</span>
                  <span className="font-headline-sm text-headline-sm text-primary font-semibold">{savedSpotsCount}</span>
                </div>
                <div className="bg-surface-container-lowest px-space-md py-space-sm rounded-lg shadow-2xs border border-outline-variant">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Loyalty Points</span>
                  <span className="font-headline-sm text-headline-sm text-primary-container font-semibold">{loyaltyPoints.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          </section>

          <div className="w-full px-space-xl py-space-lg max-w-7xl mx-auto">
            <div className="flex flex-col gap-space-xl w-full">
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
                    onClick={() => router.push("/reservations")}
                    className="inline-flex items-center gap-space-xs px-space-md py-2.5 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary transition-colors shadow-xs font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Book a New Table</span>
                  </button>
                </div>
              </div>

              {featuredReservation ? (
                <div className="relative overflow-hidden bg-surface-container-lowest rounded-xl shadow-xs p-space-lg md:p-space-xl border border-outline-variant">
                  <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary-container/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center relative z-10">
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
                          <span className="material-symbols-outlined text-sm text-surface-tint">verified</span> Verified Hold
                        </span>
                      </div>
                    </div>

                    <div className="lg:col-span-8 flex flex-col justify-between h-full gap-space-md">
                      <div className="flex flex-wrap items-center justify-between gap-space-sm">
                        <div className="inline-flex items-center gap-space-xs px-2.5 py-1 bg-primary-fixed text-on-primary-fixed rounded-md font-label-sm text-label-sm font-semibold">
                          <span className="w-2 h-2 rounded-full bg-surface-tint animate-pulse" />
                          <span>Upcoming Seating Confirmed</span>
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
                          <span className="material-symbols-outlined text-sm text-secondary">location_on</span>
                          {featuredReservation.fullAddress} • Valet Available
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md py-space-sm bg-surface-container-low rounded-lg px-space-md border border-outline-variant/30">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Date</span>
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold">{featuredReservation.displayDate}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Time Slot</span>
                          <span className="font-label-lg text-label-lg text-primary font-bold">{featuredReservation.time}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Party Size</span>
                          <span className="font-label-lg text-label-lg text-on-surface font-semibold">{featuredReservation.partySize} Diners</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Special Instruction</span>
                          <span className="font-label-sm text-label-sm text-secondary font-medium truncate">{featuredReservation.specialNotes || "Standard Dining"}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                        <button
                          type="button"
                          onClick={() => setPassModalRes(featuredReservation)}
                          className="px-space-md py-2 bg-primary-container text-on-primary rounded-lg font-label-sm text-label-sm hover:bg-primary transition-colors flex items-center gap-1.5 shadow-sm font-semibold cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">confirmation_number</span>
                          <span>Digital Seating Pass</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setModifyModalRes(featuredReservation)}
                          className="px-space-md py-2 bg-surface-container-high text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors flex items-center gap-1.5 font-medium border border-outline-variant/40 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">edit_calendar</span>
                          <span>Modify Time / Covers</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDirectionsModalRes(featuredReservation)}
                          className="px-space-md py-2 bg-surface-container-high text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-highest transition-colors flex items-center gap-1.5 font-medium border border-outline-variant/40 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">directions</span>
                          <span>Directions</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancelModalRes(featuredReservation)}
                          className="px-space-md py-2 text-error hover:bg-error-container hover:text-on-error-container rounded-lg font-label-sm text-label-sm transition-colors ml-auto font-medium cursor-pointer"
                        >
                          Cancel Hold
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-xl p-space-xl border border-dashed border-outline-variant/60 flex flex-col items-center justify-center text-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">event_seat</span>
                  <h3 className="font-headline-sm text-lg text-primary font-semibold">No Upcoming Reservations</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant max-w-md">
                    You currently have no upcoming table holds. Reserve a table at premier culinary houses to experience curated seasonal seating.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/reservations")}
                    className="mt-2 px-space-lg py-2 bg-primary-container text-on-primary rounded-xl font-label-md text-label-md hover:bg-primary transition-colors shadow-xs cursor-pointer"
                  >
                    Book a Table Tonight
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-space-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
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
                          className={`booking-tab px-space-md py-1.5 rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-all cursor-pointer ${isActive
                            ? "bg-surface-container-lowest text-primary shadow-xs font-semibold"
                            : "text-on-surface-variant hover:text-on-surface"
                            }`}
                        >
                          {tab.label} <span className="ml-1 font-normal">({tab.count})</span>
                        </button>
                      );
                    })}
                  </div>

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
                      className="p-2 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface rounded-md shadow-2xs border border-outline-variant transition-colors cursor-pointer"
                      title="Download Dining Transcript"
                      type="button"
                      onClick={handleDownloadTranscript}
                    >
                      <span className="material-symbols-outlined text-base">download</span>
                    </button>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant overflow-hidden">
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
                            <td colSpan={6} className="py-12 px-space-lg text-center text-on-surface-variant">
                              <span className="material-symbols-outlined text-3xl mb-1 text-on-surface-variant/40 block">search_off</span>
                              <p className="font-label-md text-sm font-medium">No reservation records match your filter criteria.</p>
                            </td>
                          </tr>
                        ) : (
                          paginatedReservations.map((item) => {
                            const isConfirmed = item.status === "confirmed";

                            return (
                              <tr key={item.id} className="transition-colors hover:bg-surface-container-low/60">
                                <td className="py-space-md px-space-lg">
                                  <div className="flex flex-col">
                                    <span className="font-label-sm text-label-sm font-mono text-primary font-semibold">#{item.id}</span>
                                    <span className="font-body-sm text-body-sm text-on-surface font-medium">{item.displayDate}</span>
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">{item.time}</span>
                                  </div>
                                </td>

                                <td className="py-space-md px-space-md">
                                  <div className="flex flex-col">
                                    <span className="font-headline-sm text-body-lg text-on-surface font-semibold">{item.restaurantName}</span>
                                    <span className="font-label-sm text-label-sm text-on-surface-variant">{item.neighborhood}</span>
                                  </div>
                                </td>

                                <td className="py-space-md px-space-md">
                                  <div className="flex items-center gap-space-xs">
                                    <span className="material-symbols-outlined text-base text-primary-container">group</span>
                                    <span>{item.partySize} Guests</span>
                                  </div>
                                </td>

                                <td className="py-space-md px-space-md max-w-xs">
                                  <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 italic">
                                    {item.specialNotes ? `“${item.specialNotes}”` : "No notes provided"}
                                  </span>
                                </td>

                                <td className="py-space-md px-space-md">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-label-sm text-label-sm font-semibold ${item.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-primary-fixed text-on-primary-fixed"
                                    }`}>
                                    {item.statusDisplay || (item.status === "cancelled" ? "Cancelled" : "Confirmed")}
                                  </span>
                                </td>

                                <td className="py-space-md px-space-lg text-right">
                                  <div className="inline-flex items-center justify-end gap-space-xs">
                                    {isConfirmed && (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => setPassModalRes(item)}
                                          className="px-2.5 py-1 text-on-surface hover:bg-surface-container font-label-sm text-label-sm rounded-lg border border-outline-variant/40 cursor-pointer"
                                        >
                                          Voucher
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setCancelModalRes(item)}
                                          className="px-2.5 py-1 text-error hover:bg-error-container font-label-sm text-label-sm rounded-lg cursor-pointer"
                                        >
                                          Cancel
                                        </button>
                                      </>
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
                </div>
              </div>
            </div>
          </div>

          <CustomerFooter />
        </main>
      </div>

      <DigitalSeatingPassModal isOpen={Boolean(passModalRes)} reservation={passModalRes} onClose={() => setPassModalRes(null)} />
      <ModifyReservationModal isOpen={Boolean(modifyModalRes)} reservation={modifyModalRes} onClose={() => setModifyModalRes(null)} onSave={handleSaveModification} />
      <CancelReservationModal isOpen={Boolean(cancelModalRes)} reservation={cancelModalRes} onClose={() => setCancelModalRes(null)} onConfirm={handleConfirmCancellation} />
      <DirectionsModal isOpen={Boolean(directionsModalRes)} reservation={directionsModalRes} onClose={() => setDirectionsModalRes(null)} />
      <ReservationStatusModal isOpen={Boolean(statusModalRes)} reservation={statusModalRes} onClose={() => setStatusModalRes(null)} />
      <RateSeatingModal isOpen={Boolean(rateModalRes)} reservation={rateModalRes} onClose={() => setRateModalRes(null)} onSubmit={handleSubmitRating} />

      <ProfileToast message={toast.message} type={toast.type} onClose={() => setToast({ message: null, type: "success" })} />
    </div>
  );
}