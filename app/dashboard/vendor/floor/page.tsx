// app/dashboard/vendor/floor/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ManualWalkInModal from "@/components/vendor/reservations/ManualWalkInModal";
import { TableEntity, WalkInFormInput, TableStatus } from "@/types/reservation";

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ServerReservation {
  id: string;
  tableNumber?: string;
  assignedTableId?: string;
  tableId?: string;
  guestName?: string;
  partySize: number;
  status: string;
  date?: string;
  time?: string;
  user?: {
    name?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
  } | null;
  [key: string]: any;
}

export type FloorTableEntity = TableEntity & {
  currentReservationId?: string;
  currentGuest?: string;
  currentGuestName?: string;
  shortName?: string;
  zone?: any;
  shape?: any;
  [key: string]: any;
};

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

const FLOOR_SECTIONS = [
  { name: "Main Dining Hall", range: [1, 8], defaultCap: 4, icon: "table_bar", color: "from-emerald-500/10 to-transparent" },
  { name: "Courtyard Terrace", range: [9, 14], defaultCap: 4, icon: "deck", color: "from-amber-500/10 to-transparent" },
  { name: "Private Heritage Dining", range: [15, 18], defaultCap: 6, icon: "meeting_room", color: "from-purple-500/10 to-transparent" },
  { name: "Family Hall", range: [19, 22], defaultCap: 6, icon: "family_restroom", color: "from-blue-500/10 to-transparent" },
  { name: "Party Hall", range: [23, 26], defaultCap: 8, icon: "celebration", color: "from-rose-500/10 to-transparent" },
  { name: "Big Occasion Hall", range: [27, 28], defaultCap: 16, icon: "festival", color: "from-amber-600/10 to-transparent" },
  { name: "General Hall", range: [29, 32], defaultCap: 2, icon: "storefront", color: "from-teal-500/10 to-transparent" },
];

export default function DiningRoomFloorPage() {
  const [rawReservations, setRawReservations] = useState<ServerReservation[]>([]);
  const [tableStatusOverrides, setTableStatusOverrides] = useState<
    Record<string, { status: TableStatus; guest?: string; resId?: string }>
  >({});
  const [restaurantName, setRestaurantName] = useState<string>("DineDesk Flagship Central Kitchen");
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals state
  const [activeTableForModal, setActiveTableForModal] = useState<FloorTableEntity | null>(null);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [partySizeInput, setPartySizeInput] = useState("2");
  const [guestNotesInput, setGuestNotesInput] = useState("");
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const fetchFloorTelemetry = useCallback(async () => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`${API_BASE_URL}/reservations/vendor/holds?limit=500`, {
        credentials: "include",
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        const records: ServerReservation[] = json.data || json.reservations || json.holds || [];
        setRawReservations(records);

        if (json.restaurantName) {
          setRestaurantName(json.restaurantName);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live floor telemetry:", err);
      addToast("Connection Alert", "Could not sync real-time dining room state.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFloorTelemetry();
    const interval = setInterval(fetchFloorTelemetry, 15000);
    return () => clearInterval(interval);
  }, [fetchFloorTelemetry]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const tables = useMemo((): FloorTableEntity[] => {
    const tableList: FloorTableEntity[] = [];

    FLOOR_SECTIONS.forEach((section) => {
      const [start, end] = section.range;
      for (let i = start; i <= end; i++) {
        const tableId = `table-${i}`;
        const tableLabel = `Table ${i}`;
        const shortName = `T-${i}`;
        const capacity = section.defaultCap;

        const override =
          tableStatusOverrides[tableLabel] ||
          tableStatusOverrides[tableId] ||
          tableStatusOverrides[String(i)];

        if (override) {
          tableList.push({
            id: tableId,
            label: tableLabel,
            name: tableLabel,
            shortName,
            capacity,
            zone: section.name as any,
            shape: capacity <= 2 ? "circle" : "rectangle",
            x: ((i - 1) % 6) * 16 + 10,
            y: Math.floor((i - 1) / 6) * 25 + 15,
            isAccessible: true,
            status: override.status,
            currentGuest: override.guest,
            currentGuestName: override.guest,
            currentReservationId: override.resId,
          } as unknown as FloorTableEntity);
          continue;
        }

        const matchedRes = rawReservations.find((r) => {
          const resTable = r.tableNumber || r.assignedTableId || r.tableId || "";
          const isSameTable =
            resTable === tableLabel ||
            resTable === tableId ||
            resTable === String(i) ||
            resTable === shortName;

          const isLiveStatus =
            r.status.toUpperCase() === "SEATED" ||
            r.status.toUpperCase() === "CONFIRMED";

          return isSameTable && isLiveStatus;
        });

        let calculatedStatus: TableStatus = "available";
        let guestName: string | undefined = undefined;

        if (matchedRes) {
          calculatedStatus = matchedRes.status.toUpperCase() === "SEATED" ? "occupied" : "reserved";
          guestName = matchedRes.user?.name || matchedRes.guestName || "Registered Diner";
        }

        tableList.push({
          id: tableId,
          label: tableLabel,
          name: tableLabel,
          shortName,
          capacity,
          zone: section.name as any,
          shape: capacity <= 2 ? "circle" : "rectangle",
          x: ((i - 1) % 6) * 16 + 10,
          y: Math.floor((i - 1) / 6) * 25 + 15,
          isAccessible: true,
          status: calculatedStatus,
          currentGuest: guestName,
          currentGuestName: guestName,
          partySize: matchedRes ? matchedRes.partySize : undefined,
          currentReservationId: matchedRes ? matchedRes.id : undefined,
        } as unknown as FloorTableEntity);
      }
    });

    return tableList;
  }, [rawReservations, tableStatusOverrides]);

  const handleSetStatus = async (
    tableId: string,
    newStatus: TableStatus,
    guest?: string,
    partySize: number = 2
  ) => {
    const targetTable = tables.find((t) => t.id === tableId || t.label === tableId);
    const tableLabel = targetTable?.label || tableId;

    setTableStatusOverrides((prev) => ({
      ...prev,
      [tableLabel]: { status: newStatus, guest },
    }));

    if (targetTable?.currentReservationId) {
      try {
        const headers = getRequestHeaders();
        const serverStatus =
          newStatus === "occupied" ? "SEATED" : newStatus === "available" ? "COMPLETED" : "CONFIRMED";

        await fetch(`${API_BASE_URL}/reservations/vendor/${targetTable.currentReservationId}/status`, {
          method: "PATCH",
          headers,
          credentials: "include",
          body: JSON.stringify({
            status: serverStatus,
            statusDisplay:
              serverStatus === "SEATED"
                ? "Seated"
                : serverStatus === "COMPLETED"
                  ? "Completed"
                  : "Confirmed",
          }),
        });
      } catch (err) {
        console.error("Failed to commit status change to backend:", err);
      }
    } else if (newStatus === "occupied") {
      try {
        const headers = getRequestHeaders();
        await fetch(`${API_BASE_URL}/reservations`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            partySize: Number(partySize),
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            mealPeriod: "Dinner",
            seatingArea: targetTable?.zone || "Main Dining Hall",
            tableNumber: tableLabel,
            specialNotes: `Walk-in Guest (${guest || "Walk-In Diner"})`,
            status: "SEATED",
            statusDisplay: "Seated",
          }),
        });
      } catch (err) {
        console.error("Failed to register instant walk-in to backend:", err);
      }
    }

    if (newStatus === "available") {
      addToast("Table Sanitized", `${tableLabel} is now sanitized, free, and open for seating.`, "success");
    } else if (newStatus === "occupied") {
      addToast("Party Seated", `${tableLabel} marked as Occupied by ${guest || "Guests"}.`, "success");
    } else if (newStatus === "reserved") {
      addToast("Table Reserved", `${tableLabel} placed on priority hold for incoming party.`, "info");
    }

    fetchFloorTelemetry();
  };

  const handleOpenSeatingModal = (table: FloorTableEntity) => {
    setActiveTableForModal(table);
    setGuestNameInput(table.currentGuest?.split(" (")[0] || "");
    setPartySizeInput(table.capacity.toString());
    setGuestNotesInput("");
  };

  const handleConfirmSeating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTableForModal) return;

    const guest = guestNameInput.trim() || "Walk-In Guest";
    const guestLabel = `${guest} (${partySizeInput || activeTableForModal.capacity} Guests)`;

    await handleSetStatus(
      activeTableForModal.id,
      "occupied",
      guestLabel,
      Number(partySizeInput) || activeTableForModal.capacity
    );
    setActiveTableForModal(null);
  };

  const handleWalkInSubmit = async (data: WalkInFormInput) => {
    try {
      const headers = getRequestHeaders();
      const res = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          partySize: Number(data.partySize),
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          mealPeriod: "Dinner",
          seatingArea: (data as any).preferredZone || (data as any).zone || "Main Dining Hall",
          tableNumber: data.tableId,
          specialNotes: `Walk-in Guest (${data.guestName} - ${data.phone})`,
          status: "SEATED",
          statusDisplay: "Seated",
        }),
      });

      if (res.ok) {
        setIsWalkInModalOpen(false);
        addToast("Walk-In Seated", `Seated ${data.guestName} at Table ${data.tableId}.`, "success");
        await fetchFloorTelemetry();
      } else {
        addToast("Seating Error", "Database rejected table provisioning.", "error");
      }
    } catch (err) {
      addToast("Seating Error", "Could not reach dining room database.", "error");
    }
  };

  // Metrics
  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const reservedTables = tables.filter(
    (t) => t.status === "reserved" || (t.status as string) === "assigned"
  ).length;
  const availableTables = tables.filter((t) => t.status === "available").length;

  const totalSeats = tables.reduce((acc, t) => acc + t.capacity, 0);
  const occupiedSeats = tables
    .filter((t) => t.status === "occupied")
    .reduce((acc, t) => acc + t.capacity, 0);

  const occupancyRate = totalTables > 0 ? Math.round(((occupiedTables + reservedTables) / totalTables) * 100) : 0;

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      if (selectedZone !== "all" && table.zone !== selectedZone) return false;
      if (selectedStatus !== "all" && table.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = table.id.toLowerCase().includes(query);
        const matchesLabel = table.label.toLowerCase().includes(query);
        const matchesGuest = table.currentGuest?.toLowerCase().includes(query) || false;
        if (!matchesId && !matchesLabel && !matchesGuest) return false;
      }
      return true;
    });
  }, [tables, selectedZone, selectedStatus, searchQuery]);

  // Two neat rows of 4 buttons each
  const firstRowItems = useMemo(() => [
    { name: "all", label: "All Sections", icon: "grid_view", count: totalTables },
    ...FLOOR_SECTIONS.slice(0, 3).map((s) => ({
      name: s.name,
      label: s.name,
      icon: s.icon,
      count: tables.filter((t) => t.zone === s.name).length,
    })),
  ], [totalTables, tables]);

  const secondRowItems = useMemo(() => [
    ...FLOOR_SECTIONS.slice(3).map((s) => ({
      name: s.name,
      label: s.name,
      icon: s.icon,
      count: tables.filter((t) => t.zone === s.name).length,
    })),
  ], [tables]);

  return (
    <div className="w-full min-h-screen bg-[#FBFBFA] font-sans text-[#1b3b2b] antialiased selection:bg-[#1b3b2b] selection:text-white pb-20 overflow-x-hidden">
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* 1. Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1b3b2b]/10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-[#1b3b2b]/5 text-[#1b3b2b]">
                <span className="material-symbols-outlined text-xl">grid_view</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1b3b2b] tracking-tight">
                Dining Room Floor Plan
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Live Floor Matrix
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Real-time interactive dining floor layout, table allocation, and turnover for{" "}
              <strong>{restaurantName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                setLoading(true);
                fetchFloorTelemetry().then(() =>
                  addToast(
                    "Floor Synchronized",
                    "Loaded real-time floor plan tables and seating statuses.",
                    "info"
                  )
                );
              }}
              disabled={loading}
              className="px-3.5 py-2 bg-white hover:bg-[#1b3b2b]/5 rounded-xl text-xs font-bold text-[#1b3b2b] border border-[#1b3b2b]/15 shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-base ${loading ? "animate-spin" : ""}`}>refresh</span>
              <span>{loading ? "Syncing..." : "Sync Floor"}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setIsWalkInModalOpen(true)}
              className="px-4 py-2 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              <span>Seat Walk-In</span>
            </motion.button>
          </div>
        </motion.div>

        {/* 2. KPI Metric Cards Strip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Card 1: Floor Occupancy */}
          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Floor Occupancy</span>
              <span className="material-symbols-outlined text-[#1b3b2b] text-lg">pie_chart</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#1b3b2b]">{occupancyRate}%</span>
              <span className="text-xs text-neutral-500 font-medium">
                ({occupiedTables + reservedTables} / {totalTables} Tables)
              </span>
            </div>
            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${occupancyRate}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-[#1b3b2b] h-full rounded-full"
              />
            </div>
          </div>

          {/* Card 2: Seated Diners */}
          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Seated Diners</span>
              <span className="material-symbols-outlined text-[#C05621] text-lg">groups</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#C05621]">{occupiedSeats}</span>
              <span className="text-xs text-neutral-500 font-medium">of {totalSeats} capacity</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Active across {FLOOR_SECTIONS.length} dining floor sections
            </p>
          </div>

          {/* Card 3: Available Tables */}
          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Available Tables</span>
              <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-700">{availableTables}</span>
              <span className="text-xs text-emerald-600 font-bold">Ready to Seat</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Sanitized and staged for instant seating
            </p>
          </div>

          {/* Card 4: Reserved Tables */}
          <div className="p-4 rounded-2xl bg-white border border-[#1b3b2b]/10 shadow-xs space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="text-xs font-bold uppercase tracking-wider">Reserved Tables</span>
              <span className="material-symbols-outlined text-amber-600 text-lg">event_seat</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-700">{reservedTables}</span>
              <span className="text-xs text-neutral-500 font-medium">Scheduled</span>
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Assigned to incoming confirmed reservations
            </p>
          </div>
        </motion.div>

        {/* 3. Filter Toolbar with 4x2 Premium Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="p-5 sm:p-6 rounded-3xl bg-white border border-[#1b3b2b]/10 shadow-sm space-y-4"
        >
          {/* Top Controls: Search Icon, Filter Dropdown, and Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-4 flex-wrap text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                <span className="font-bold text-emerald-800">Available ({availableTables})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs" />
                <span className="font-bold text-rose-800">Occupied ({occupiedTables})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
                <span className="font-bold text-amber-800">Reserved ({reservedTables})</span>
              </div>
              <span className="text-neutral-300 hidden sm:inline">•</span>
              <span className="text-[11px] font-mono text-neutral-400">
                {filteredTables.length} of {totalTables} tables displayed
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="relative flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 190, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden mr-2"
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search table/guest..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs text-[#1b3b2b] font-medium focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => {
                    setIsSearchOpen((prev) => !prev);
                    if (isSearchOpen && searchQuery) {
                      setSearchQuery("");
                    }
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border cursor-pointer transition-all ${isSearchOpen || searchQuery
                      ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-xs"
                      : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  title={isSearchOpen ? "Close Search" : "Search Tables & Guests"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {isSearchOpen ? "close" : "search"}
                  </span>
                </motion.button>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-bold text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b] cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="available">Available (Free)</option>
                <option value="occupied">Occupied (Seated)</option>
                <option value="reserved">Reserved / Assigned</option>
              </select>
            </div>
          </div>

          {/* 4x2 Grid: Line 1 (4 buttons) and Line 2 (4 buttons) */}
          <div className="space-y-2.5">
            {/* First Line: 4 Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {firstRowItems.map((item) => {
                const isActive = selectedZone === item.name;
                return (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => setSelectedZone(item.name)}
                    className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 overflow-hidden ${isActive
                        ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-md shadow-[#1b3b2b]/15"
                        : "bg-gradient-to-b from-white to-neutral-50/70 text-[#1b3b2b] border-neutral-200 hover:border-[#1b3b2b]/40 hover:bg-white shadow-2xs"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`material-symbols-outlined text-lg ${isActive ? "text-[#E2B774]" : "text-[#1b3b2b]/70"}`}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold truncate block">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${isActive
                          ? "bg-white/15 text-white border border-white/20"
                          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                    >
                      {item.count}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Second Line: 4 Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {secondRowItems.map((item) => {
                const isActive = selectedZone === item.name;
                return (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    type="button"
                    onClick={() => setSelectedZone(item.name)}
                    className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 overflow-hidden ${isActive
                        ? "bg-[#1b3b2b] text-white border-[#1b3b2b] shadow-md shadow-[#1b3b2b]/15"
                        : "bg-gradient-to-b from-white to-neutral-50/70 text-[#1b3b2b] border-neutral-200 hover:border-[#1b3b2b]/40 hover:bg-white shadow-2xs"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`material-symbols-outlined text-lg ${isActive ? "text-[#E2B774]" : "text-[#1b3b2b]/70"}`}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold truncate block">
                        {item.label}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${isActive
                          ? "bg-white/15 text-white border border-white/20"
                          : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                        }`}
                    >
                      {item.count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* 4. Multi-Section Floor Layout */}
        <div className="space-y-6">
          <AnimatePresence>
            {(selectedZone === "all" ? FLOOR_SECTIONS.map((s) => s.name) : [selectedZone]).map((zoneName) => {
              const zoneTables = filteredTables.filter((t) => t.zone === zoneName);
              const sectionMeta = FLOOR_SECTIONS.find((s) => s.name === zoneName);
              if (zoneTables.length === 0 && selectedZone === "all") return null;

              return (
                <motion.div
                  key={zoneName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-[#1b3b2b]/10 shadow-xs hover:shadow-md transition-shadow space-y-4 relative overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-80 h-32 bg-gradient-to-l ${sectionMeta?.color || "from-emerald-500/5 to-transparent"} pointer-events-none rounded-bl-full`} />

                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100 relative z-10">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#1b3b2b] text-xl">
                        {sectionMeta?.icon || "table_bar"}
                      </span>
                      <h2 className="text-lg font-bold text-[#1b3b2b] tracking-tight">
                        {zoneName}
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-xl">
                      {zoneTables.length} Tables Active
                    </span>
                  </div>

                  {zoneTables.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic py-4">
                      No tables in {zoneName} match the current filter criteria.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
                      {zoneTables.map((table) => {
                        const isOccupied = table.status === "occupied";
                        const isReserved =
                          table.status === "reserved" || (table.status as string) === "assigned";

                        return (
                          <motion.div
                            key={table.id}
                            layout
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group shadow-2xs hover:shadow-md ${isOccupied
                                ? "bg-rose-50/50 border-rose-200/90"
                                : isReserved
                                  ? "bg-amber-50/50 border-amber-200/90"
                                  : "bg-white border-neutral-200/90 hover:border-[#1b3b2b]/40"
                              }`}
                          >
                            {/* Top Bar: Table Label & Status Badge */}
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-base text-[#1b3b2b]">
                                    {table.label}
                                  </span>
                                  <span className="text-[11px] font-bold text-neutral-400">
                                    • {table.capacity}-Top
                                  </span>
                                </div>
                                <span className="text-[11px] text-neutral-400 font-medium block mt-0.5">
                                  {table.zone}
                                </span>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isOccupied
                                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                                    : isReserved
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}
                              >
                                {isOccupied ? "Occupied" : isReserved ? "Reserved" : "Available"}
                              </span>
                            </div>

                            {/* Middle: Occupant & Booking Info */}
                            <div className="min-h-[44px] flex flex-col justify-center">
                              {table.currentGuest ? (
                                <div className="space-y-0.5">
                                  <span className="text-xs font-bold text-[#1b3b2b] block truncate flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm text-neutral-400">person</span>
                                    <span>{table.currentGuest}</span>
                                  </span>
                                  {(table as any).currentReservationId && (
                                    <span className="text-[10px] text-neutral-400 font-mono block">
                                      Ref: #{(table as any).currentReservationId.slice(-8)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-semibold italic flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Ready for walk-in seating
                                </span>
                              )}
                            </div>

                            {/* Bottom: Quick Operations Button Group */}
                            <div className="pt-2 border-t border-neutral-100 flex items-center gap-1.5">
                              {table.status === "available" ? (
                                <>
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => handleOpenSeatingModal(table)}
                                    className="flex-1 py-1.5 px-2 bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white rounded-xl text-xs font-bold cursor-pointer text-center transition-colors shadow-2xs"
                                  >
                                    Seat Table
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => handleSetStatus(table.id, "reserved", "Reserved Guest")}
                                    className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                    title="Hold table as reserved"
                                  >
                                    Hold
                                  </motion.button>
                                </>
                              ) : isOccupied ? (
                                <>
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => handleSetStatus(table.id, "available")}
                                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer text-center transition-colors shadow-2xs"
                                  >
                                    Clear Table
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => handleOpenSeatingModal(table)}
                                    className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                    title="Edit seated guest details"
                                  >
                                    Edit
                                  </motion.button>
                                </>
                              ) : (
                                <>
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => handleOpenSeatingModal(table)}
                                    className="flex-1 py-1.5 px-2 bg-[#C05621] hover:bg-[#C05621]/90 text-white rounded-xl text-xs font-bold cursor-pointer text-center transition-colors shadow-2xs"
                                  >
                                    Seat Now
                                  </motion.button>
                                  <motion.button
                                    whileTap={{ scale: 0.96 }}
                                    type="button"
                                    onClick={() => handleSetStatus(table.id, "available")}
                                    className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-[#1b3b2b] rounded-xl text-xs font-bold cursor-pointer transition-colors"
                                    title="Cancel hold / release table"
                                  >
                                    Release
                                  </motion.button>
                                </>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Walk-in Full Reservation Modal */}
      <ManualWalkInModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        tables={tables as unknown as TableEntity[]}
        onSubmit={handleWalkInSubmit}
      />

      {/* Quick Table Seating Dialog */}
      <AnimatePresence>
        {activeTableForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#1b3b2b]/5 text-[#1b3b2b]">
                    <span className="material-symbols-outlined text-lg">event_seat</span>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#1b3b2b]">
                      Seat {activeTableForModal.label}
                    </h3>
                    <span className="text-xs text-neutral-400 font-medium">
                      {activeTableForModal.zone} • Capacity: {activeTableForModal.capacity} guests
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTableForModal(null)}
                  className="p-1 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <form onSubmit={handleConfirmSeating} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anaiya Meherjabin"
                    value={guestNameInput}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
                    Party Size (Guests) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={activeTableForModal.capacity + 4}
                    value={partySizeInput}
                    onChange={(e) => setPartySizeInput(e.target.value)}
                    className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#1b3b2b] block mb-1">
                    Host Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP booth request, anniversary dinner"
                    value={guestNotesInput}
                    onChange={(e) => setGuestNotesInput(e.target.value)}
                    className="w-full bg-neutral-50 px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-[#1b3b2b] focus:outline-none focus:ring-1 focus:ring-[#1b3b2b]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTableForModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#1b3b2b] hover:bg-[#1b3b2b]/90 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Confirm Seating
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Animated Toasts */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto p-3.5 rounded-2xl border shadow-lg flex items-start gap-3 bg-white ${toast.type === "error"
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
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}