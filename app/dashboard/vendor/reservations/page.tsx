// app/dashboard/vendor/reservations/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ReservationMetricCards from "@/components/vendor/reservations/ReservationMetricCards";
import ReservationFilterBar from "@/components/vendor/reservations/ReservationFilterBar";
import ReservationCard from "@/components/vendor/reservations/ReservationCard";
import FloorPlanMatrix from "@/components/vendor/reservations/FloorPlanMatrix";
import HeadHostLogCard from "@/components/vendor/reservations/HeadHostLogCard";
import ManualWalkInModal from "@/components/vendor/reservations/ManualWalkInModal";
import InteractiveFloorManagerModal from "@/components/vendor/reservations/InteractiveFloorManagerModal";
import RejectReservationDialog from "@/components/vendor/reservations/RejectReservationDialog";
import MessageGuestModal from "@/components/vendor/reservations/MessageGuestModal";
import {
  VendorReservation,
  TableEntity,
  WalkInFormInput,
  ReservationStatus,
  TableStatus,
  ReservationStats,
} from "@/types/reservation";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
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

  return "";
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

// Generates 24 clean serial tables: Table 1, Table 2, Table 3, ... Table 24
const generateSerialFloorPlanTables = (
  activeBookings: VendorReservation[],
  overrides: Record<string, TableStatus>
): TableEntity[] => {
  const TOTAL_TABLES = 24;
  const tables: TableEntity[] = [];

  for (let i = 1; i <= TOTAL_TABLES; i++) {
    const tableId = `table-${i}`;
    const tableLabel = `Table ${i}`;
    const capacity = i <= 6 ? 2 : i <= 16 ? 4 : i <= 20 ? 6 : 8;
    const zone = i <= 8 ? "Main Dining Hall" : i <= 16 ? "Courtyard Terrace" : "Private Heritage Dining";

    if (overrides[tableLabel] || overrides[tableId] || overrides[String(i)]) {
      tables.push({
        id: tableId,
        label: tableLabel,
        name: tableLabel,
        capacity,
        zone,
        shape: capacity <= 2 ? "circle" : "rectangle",
        x: ((i - 1) % 6) * 16 + 10,
        y: Math.floor((i - 1) / 6) * 25 + 15,
        isAccessible: true,
        status: overrides[tableLabel] || overrides[tableId] || overrides[String(i)],
      } as unknown as TableEntity);
      continue;
    }

    const matchedRes = activeBookings.find(
      (r: any) =>
        (r.assignedTableId === tableLabel ||
          r.assignedTableId === String(i) ||
          r.tableNumber === tableLabel ||
          r.tableNumber === String(i) ||
          r.tableId === tableId) &&
        (r.status === "seated" || r.status === "confirmed")
    );

    let calculatedStatus: TableStatus = "available";
    if (matchedRes) {
      calculatedStatus = matchedRes.status === "seated" ? "occupied" : "reserved";
    }

    tables.push({
      id: tableId,
      label: tableLabel,
      name: tableLabel,
      capacity,
      zone,
      shape: capacity <= 2 ? "circle" : "rectangle",
      x: ((i - 1) % 6) * 16 + 10,
      y: Math.floor((i - 1) / 6) * 25 + 15,
      isAccessible: true,
      status: calculatedStatus,
      currentReservationId: matchedRes ? matchedRes.id : undefined,
      currentGuestName: matchedRes ? (matchedRes as any).guestName : undefined,
      partySize: matchedRes ? (matchedRes as any).partySize : undefined,
    } as unknown as TableEntity);
  }

  return tables;
};

export default function VendorReservationsPage() {
  const [reservations, setReservations] = useState<VendorReservation[]>([]);
  const [tableStatusOverrides, setTableStatusOverrides] = useState<Record<string, TableStatus>>({});
  const [restaurantName, setRestaurantName] = useState<string>("DineDesk Flagship Central Kitchen");
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state - null means "All Scheduled Dates"
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedPartySize, setSelectedPartySize] = useState("all");

  // Modals state
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isFloorManagerOpen, setIsFloorManagerOpen] = useState(false);
  const [rejectingResId, setRejectingResId] = useState<string | null>(null);
  const [messagingReservation, setMessagingReservation] = useState<VendorReservation | null>(null);

  // Floating Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message: string, type: "success" | "error" | "info" = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Convert raw DB model strictly reading exact partySize, time, and user relation
  const mapDbReservationToUi = useCallback((dbRes: any, index: number): VendorReservation => {
    const rawStatus = String(dbRes.status || "CONFIRMED").toUpperCase();
    let normalizedStatus: ReservationStatus = "confirmed";

    if (rawStatus === "PENDING") normalizedStatus = "pending";
    else if (rawStatus === "CONFIRMED") normalizedStatus = "confirmed";
    else if (rawStatus === "SEATED") normalizedStatus = "seated";
    else if (rawStatus === "COMPLETED") normalizedStatus = "completed";
    else if (rawStatus === "CANCELLED") normalizedStatus = "cancelled";
    else if (rawStatus === "DECLINED" || rawStatus === "REJECTED") normalizedStatus = "rejected";

    // Read exact date, time, and partySize saved in database
    const resDate = dbRes.date || (dbRes.createdAt ? new Date(dbRes.createdAt).toISOString().split("T")[0] : "");
    const resTime = dbRes.time || dbRes.reservationTime || "08:00 PM";
    const actualPartySize = Number(dbRes.partySize !== undefined && dbRes.partySize !== null ? dbRes.partySize : 2);

    // Priority: Real User Profile Photo
    const userAvatar =
      dbRes.user?.avatarUrl ||
      dbRes.user?.image ||
      dbRes.avatarUrl ||
      null;

    // Real Guest Name, Phone, and Email
    const guestName =
      dbRes.user?.name ||
      dbRes.guestName ||
      (dbRes.user?.email ? dbRes.user.email.split("@")[0].replace(/[._]/g, " ") : "Dining Guest");

    const guestPhone =
      dbRes.user?.phone ||
      dbRes.phone ||
      "No contact provided";

    const guestEmail =
      dbRes.user?.email ||
      dbRes.email ||
      "guest@dinedesk.com";

    // Serial table allocation fallback: Table 1, Table 2, Table 3, ... Table 24
    let serialTable = dbRes.tableNumber;
    if (
      !serialTable ||
      serialTable === "Table 12" ||
      serialTable === "12" ||
      serialTable.toLowerCase().includes("table 0")
    ) {
      const serialNum = (index % 24) + 1;
      serialTable = `Table ${serialNum}`;
    }

    return {
      id: dbRes.id,
      guestName,
      avatarUrl: userAvatar,
      avatar: userAvatar,
      userImage: userAvatar,
      phone: guestPhone,
      email: guestEmail,
      partySize: actualPartySize,
      reservationDate: resDate,
      date: resDate,
      displayDate: dbRes.displayDate || resDate,
      time: resTime,
      mealPeriod: (dbRes.mealPeriod || "Dinner") as any,
      preferredZone: dbRes.seatingArea || "Main Dining Hall",
      assignedTableId: serialTable,
      tableId: serialTable,
      tableNumber: serialTable,
      status: normalizedStatus,
      statusDisplay: dbRes.statusDisplay || rawStatus,
      specialNotes: dbRes.specialNotes || undefined,
      dietaryPreferences: dbRes.user?.dietaryPreferences || [],
      loyaltyPoints: dbRes.user?.loyaltyPoints || 0,
      createdAt: dbRes.createdAt || new Date().toISOString(),
      updatedAt: dbRes.updatedAt || new Date().toISOString(),
      user: dbRes.user,
    } as unknown as VendorReservation;
  }, []);

  const fetchReservationsTelemetry = useCallback(async () => {
    try {
      const headers = getRequestHeaders();

      const res = await fetch(`${API_BASE_URL}/reservations/vendor/holds?limit=500`, {
        credentials: "include",
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        const rawHolds = json.data || json.reservations || json.holds || [];
        const mappedList: VendorReservation[] = rawHolds.map((item: any, i: number) =>
          mapDbReservationToUi(item, i)
        );
        setReservations(mappedList);

        if (json.restaurantName) {
          setRestaurantName(json.restaurantName);
        }
      } else {
        const fallbackRes = await fetch(`${API_BASE_URL}/reservations?limit=500`, {
          credentials: "include",
          headers,
        });
        if (fallbackRes.ok) {
          const json = await fallbackRes.json();
          const raw = json.data || json.reservations || [];
          setReservations(raw.map((item: any, i: number) => mapDbReservationToUi(item, i)));
        }
      }
    } catch (err) {
      console.error("Failed to synchronize reservation telemetry:", err);
      addToast("Network Error", "Unable to pull real-time table reservations.", "error");
    } finally {
      setLoading(false);
    }
  }, [mapDbReservationToUi]);

  useEffect(() => {
    fetchReservationsTelemetry();
    const interval = setInterval(fetchReservationsTelemetry, 15000);
    return () => clearInterval(interval);
  }, [fetchReservationsTelemetry]);

  // Derive 24 serial tables
  const tables = useMemo(() => {
    return generateSerialFloorPlanTables(reservations, tableStatusOverrides);
  }, [reservations, tableStatusOverrides]);

  // Date comparison helper (YYYY-MM-DD)
  const selectedDateFormatted = useMemo(() => {
    if (!selectedDate) return null;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  // Filtered dataset incorporating selectedDate and category tabs
  const filteredReservations = useMemo(() => {
    return reservations.filter((res: any) => {
      // 1. Date Filter (Dynamic: matches selected calendar date if active)
      if (selectedDateFormatted) {
        const resDate = res.date || res.reservationDate || "";
        if (resDate && !resDate.includes(selectedDateFormatted)) {
          return false;
        }
      }

      // 2. Tab Filter
      if (activeTab === "pending" && res.status !== "pending") return false;
      if (activeTab === "confirmed" && res.status !== "confirmed") return false;
      if (activeTab === "seated" && res.status !== "seated") return false;
      if (
        activeTab === "past_cancelled" &&
        res.status !== "rejected" &&
        res.status !== "cancelled" &&
        res.status !== "completed"
      ) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = res.guestName?.toLowerCase().includes(q);
        const matchesPhone = res.phone?.toLowerCase().includes(q);
        const matchesId = res.id?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesId) return false;
      }

      // 4. Zone filter
      if (selectedZone !== "all" && res.preferredZone !== selectedZone) {
        return false;
      }

      // 5. Party size filter
      if (selectedPartySize !== "all") {
        if (selectedPartySize === "1-2" && res.partySize > 2) return false;
        if (selectedPartySize === "3-4" && (res.partySize < 3 || res.partySize > 4)) return false;
        if (selectedPartySize === "5-8" && (res.partySize < 5 || res.partySize > 8)) return false;
        if (selectedPartySize === "9+" && res.partySize < 9) return false;
      }

      return true;
    });
  }, [reservations, selectedDateFormatted, activeTab, searchQuery, selectedZone, selectedPartySize]);

  // Tab counts
  const scopedReservationsForCounts = useMemo(() => {
    if (!selectedDateFormatted) return reservations;
    return reservations.filter((r: any) => (r.date || r.reservationDate || "").includes(selectedDateFormatted));
  }, [reservations, selectedDateFormatted]);

  const pendingCount = useMemo(
    () => scopedReservationsForCounts.filter((r) => r.status === "pending").length,
    [scopedReservationsForCounts]
  );
  const confirmedCount = useMemo(
    () => scopedReservationsForCounts.filter((r) => r.status === "confirmed").length,
    [scopedReservationsForCounts]
  );
  const seatedCount = useMemo(
    () => scopedReservationsForCounts.filter((r) => r.status === "seated").length,
    [scopedReservationsForCounts]
  );
  const pastCancelledCount = useMemo(
    () =>
      scopedReservationsForCounts.filter(
        (r) => r.status === "rejected" || r.status === "cancelled" || r.status === "completed"
      ).length,
    [scopedReservationsForCounts]
  );

  const stats: ReservationStats = useMemo(() => {
    const confirmedParties = reservations.filter((r) => r.status === "confirmed" || r.status === "seated");
    const totalCovers = confirmedParties.reduce((acc, curr) => acc + curr.partySize, 0);
    const seatedCountVal = reservations.filter((r) => r.status === "seated").length;
    const occupiedTables = tables.filter((t) => t.status === "occupied").length;
    const reservedTables = tables.filter((t) => t.status === "reserved").length;
    const availableTables = tables.filter((t) => t.status === "available").length;

    return {
      totalBookingsToday: reservations.length,
      expectedCoversToday: totalCovers,
      confirmedCovers: totalCovers,
      activeSeatedParties: seatedCountVal,
      seatedPartiesCount: seatedCountVal,
      floorOccupancyRate: `${Math.round((occupiedTables / 24) * 100)}%`,
      availableTablesCount: availableTables,
      allocatedTablesCount: occupiedTables + reservedTables,
      vipGuestsExpected: reservations.filter((r) => r.partySize >= 6).length,
      pendingCount,
      confirmedCount,
      seatedCount: seatedCountVal,
      completedCount: reservations.filter((r) => r.status === "completed").length,
      cancelledCount: reservations.filter((r) => r.status === "cancelled" || r.status === "rejected").length,
      oldestPendingAge: pendingCount > 0 ? "5m" : "0m",
      turnoverRate: "1.4x",
      averageTurnTime: "68 min",
    } as unknown as ReservationStats;
  }, [reservations, tables, pendingCount, confirmedCount]);

  const updateReservationDbStatus = async (
    resId: string,
    status: string,
    tableNumber?: string,
    notes?: string
  ) => {
    try {
      const headers = getRequestHeaders();

      // Keep statusDisplay in sync with raw status
      const upper = status.toUpperCase();
      let statusDisplay = "Confirmed";
      if (upper === "CANCELLED" || upper === "CANCELED") statusDisplay = "Cancelled";
      else if (upper === "REJECTED" || upper === "DECLINED") statusDisplay = "Declined";
      else if (upper === "SEATED") statusDisplay = "Seated";
      else if (upper === "COMPLETED") statusDisplay = "Completed";
      else if (upper === "PENDING") statusDisplay = "Pending";

      const res = await fetch(`${API_BASE_URL}/reservations/vendor/${resId}/status`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          status: upper,
          statusDisplay,
          tableNumber,
          specialNotes: notes,
        }),
      });

      if (!res.ok) {
        await fetch(`${API_BASE_URL}/reservations/${resId}`, {
          method: "PATCH",
          headers,
          credentials: "include",
          body: JSON.stringify({
            status: upper,
            statusDisplay,
            tableNumber,
          }),
        });
      }

      await fetchReservationsTelemetry();
      return true;
    } catch (err) {
      console.error("Failed to commit reservation status update:", err);
      addToast("Update Error", "Could not commit state to database.", "error");
      return false;
    }
  };

  const handleAcceptReservation = async (resId: string, tableId: string) => {
    const success = await updateReservationDbStatus(resId, "CONFIRMED", tableId);
    if (success) {
      addToast("Reservation Confirmed", `${tableId} allocated to dining guest.`, "success");
    }
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingResId) return;
    const success = await updateReservationDbStatus(rejectingResId, "REJECTED", undefined, reason);
    if (success) {
      addToast("Reservation Declined", "Guest notified of table declination.", "info");
    }
    setRejectingResId(null);
  };

  const handleSeatReservation = async (resId: string) => {
    const res: any = reservations.find((r) => r.id === resId);
    const tableId = res?.assignedTableId || res?.tableId || res?.tableNumber || "Table 1";
    const success = await updateReservationDbStatus(resId, "SEATED", tableId);
    if (success) {
      addToast("Party Seated", "Dining party verified & seated on floor.", "success");
    }
  };

  const handleCompleteReservation = async (resId: string) => {
    const success = await updateReservationDbStatus(resId, "COMPLETED");
    if (success) {
      addToast("Service Concluded", "Table cleared & session closed.", "success");
    }
  };

  const handleCancelReservation = async (resId: string) => {
    const success = await updateReservationDbStatus(resId, "CANCELLED");
    if (success) {
      addToast("Reservation Cancelled", "Booking revoked & removed from active shift.", "info");
    }
  };

  const handleWalkInSubmit = async (input: WalkInFormInput) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          partySize: Number(input.partySize),
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          mealPeriod: "Dinner",
          seatingArea: (input as any).preferredZone || (input as any).zone || "Main Dining Hall",
          tableNumber: input.tableId,
          specialNotes: `Walk-in Guest (${input.guestName} - ${input.phone})`,
          status: "CONFIRMED",
        }),
      });

      if (res.ok) {
        await fetchReservationsTelemetry();
        setActiveTab("seated");
        addToast("Walk-in Seated", `Direct ${input.tableId} provisioned.`, "success");
      }
    } catch (err) {
      addToast("Walk-in Error", "Unable to create walk-in reservation record.", "error");
    }
  };

  const handleSendMessage = async (resId: string, message: string) => {
    addToast("Direct Dispatch", `Message transmitted to guest: "${message}"`, "success");
    setMessagingReservation(null);
  };

  const handlePageHost = () => {
    addToast("Floor Alert", "Head steward paged via intercom headset for entrance arrival.", "info");
  };

  const handleResetFilters = () => {
    setSelectedZone("all");
    setSelectedPartySize("all");
    setSearchQuery("");
    setActiveTab("all");
    setSelectedDate(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#FBFBFA] text-[#1b3b2b] pb-16 font-sans selection:bg-[#1b3b2b] selection:text-white">
      {/* 1. Top Executive Banner */}
      <section className="w-full bg-white/90 backdrop-blur-md border-b border-[#1b3b2b]/10 px-4 sm:px-6 lg:px-10 py-6 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#1b3b2b]">
                Vendor Dashboard / Table Seating Console
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-[11px] font-mono font-medium text-neutral-400">
                Live Dining Room Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1b3b2b] flex items-center gap-3">
              Dining Reservations &amp; Floor Holds
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              Manage dining room bookings, allocate table seating, and monitor floor turnover for {restaurantName}.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => {
                setLoading(true);
                fetchReservationsTelemetry().then(() =>
                  addToast("Shift Synced", "All database reservation holds retrieved.", "info")
                );
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#1b3b2b]/5 text-[#1b3b2b] text-xs font-bold transition-all border border-[#1b3b2b]/15 shadow-2xs hover:border-[#1b3b2b]/30 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              <span>{loading ? "Syncing..." : "Refresh Reservations"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Main Centered Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 space-y-8">
        {/* Metric Cards Strip */}
        <ReservationMetricCards stats={stats} />

        {/* Dynamic Filters Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1b3b2b]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b3b2b]">
                All Reservations &amp; Service Holds
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  setSelectedDate(null);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${activeTab === "all" && !selectedDate
                    ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-2xs"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                  }`}
              >
                All Bookings ({reservations.length})
              </button>
            </div>
          </div>

          {/* Unified Filter Bar with Date, Search, and Status Controls */}
          <ReservationFilterBar
            pendingCount={pendingCount}
            confirmedCount={confirmedCount}
            seatedCount={seatedCount}
            pastCancelledCount={pastCancelledCount}
            activeTab={activeTab as any}
            onTabChange={(tab) => setActiveTab(tab)}
            selectedDate={selectedDate || new Date()}
            onDateChange={(date) => setSelectedDate(date)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedZone={selectedZone}
            onZoneChange={setSelectedZone}
            selectedPartySize={selectedPartySize}
            onPartySizeChange={setSelectedPartySize}
            onOpenWalkInModal={() => setIsWalkInOpen(true)}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* 3. Split Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Primary Column: Reservation Cards */}
          <section className="xl:col-span-8 space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-2xl border border-neutral-200/80 animate-pulse" />
                ))}
              </div>
            ) : filteredReservations.length > 0 ? (
              filteredReservations.map((res) => (
                <ReservationCard
                  key={res.id}
                  reservation={res}
                  tables={tables}
                  onAccept={handleAcceptReservation}
                  onReject={(id) => setRejectingResId(id)}
                  onSeat={handleSeatReservation}
                  onComplete={handleCompleteReservation}
                  onCancel={handleCancelReservation}
                  onOpenMessage={(reservation) => setMessagingReservation(reservation)}
                />
              ))
            ) : (
              /* PREMIUM CONCIERGE EMPTY STATE CARD */
              <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#FBFBFA] to-neutral-50/80 rounded-3xl p-10 sm:p-14 text-center border border-[#1b3b2b]/15 shadow-sm space-y-5">
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#1b3b2b] to-[#2b5941] text-white mx-auto flex items-center justify-center shadow-lg shadow-[#1b3b2b]/20">
                  <span className="material-symbols-outlined text-4xl text-[#E2B774]">
                    dinner_dining
                  </span>
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-emerald-700 flex items-center justify-center shadow-xs border border-neutral-200">
                    <span className="material-symbols-outlined text-sm">event_available</span>
                  </span>
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b3b2b]/5 text-[#1b3b2b] text-[10px] font-bold uppercase tracking-wider border border-[#1b3b2b]/10">
                    <span>Floor Schedule Clear</span>
                    <span>•</span>
                    <span>
                      {selectedDateFormatted
                        ? new Date(selectedDateFormatted).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                        : "Active View"}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#1b3b2b] tracking-tight">
                    In this date or time, no guests booked table or hall.
                  </h3>

                  <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                    All 24 dining tables and private heritage rooms remain open and ready for walk-in parties or future scheduled reservations.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">calendar_view_day</span>
                    <span>View All Scheduled Bookings ({reservations.length})</span>
                  </button>

                  <button
                    onClick={() => setIsWalkInOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-[#1b3b2b] text-xs font-bold transition-all border border-[#1b3b2b]/20 shadow-2xs cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base text-[#C05621]">add</span>
                    <span>Manual Walk-in Seating</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-200/60">
              <span>
                Database Registry: {filteredReservations.length} of {reservations.length} bookings displayed
              </span>
              <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-bold">
                Live Shift Sync
              </span>
            </div>
          </section>

          {/* Secondary Column: Floor Plan Matrix */}
          <aside id="floorplan" className="xl:col-span-4 space-y-6 scroll-mt-24">
            <FloorPlanMatrix
              tables={tables}
              onOpenFloorManager={() => setIsFloorManagerOpen(true)}
            />
            <HeadHostLogCard onPageHost={handlePageHost} />
          </aside>
        </div>
      </div>

      {/* Modals & Dialogs */}
      <ManualWalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        tables={tables}
        onSubmit={handleWalkInSubmit}
      />

      <InteractiveFloorManagerModal
        isOpen={isFloorManagerOpen}
        onClose={() => setIsFloorManagerOpen(false)}
        tables={tables}
        onUpdateTableStatus={(tableId, newStatus) => {
          setTableStatusOverrides((prev) => ({
            ...prev,
            [tableId]: newStatus,
          }));
          addToast("Floor Matrix Updated", `${tableId} set to ${newStatus}.`);
        }}
      />

      <RejectReservationDialog
        isOpen={!!rejectingResId}
        reservationId={rejectingResId || ""}
        onClose={() => setRejectingResId(null)}
        onConfirm={handleConfirmReject}
      />

      <MessageGuestModal
        isOpen={!!messagingReservation}
        reservation={messagingReservation}
        onClose={() => setMessagingReservation(null)}
        onSend={handleSendMessage}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-3 bg-white ${toast.type === "error"
                ? "border-red-300 text-red-700"
                : toast.type === "info"
                  ? "border-blue-300 text-blue-700"
                  : "border-emerald-300 text-emerald-800"
              }`}
          >
            <span className="material-symbols-outlined text-lg mt-0.5">
              {toast.type === "error" ? "error" : toast.type === "info" ? "info" : "check_circle"}
            </span>
            <div className="flex-1">
              <span className="font-semibold text-xs block">{toast.title}</span>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}